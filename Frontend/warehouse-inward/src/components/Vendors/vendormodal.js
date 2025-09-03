import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VendorModal = ({ vendor, onClose, onSuccess }) => {
  const isEdit = !!vendor;
  const defaultFormData = {
    vendor_name: "",
    contact_person: "",
    contact_number: "",
    gst_number: "",
    address: "",
    status: "Active",
  };
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      setFormData({
        vendor_name: vendor.vendor_name || "",
        contact_person: vendor.contact_person || "",
        contact_number: vendor.contact_number || "",
        gst_number: vendor.gst_number || "",
        address: vendor.address || "",
        status: vendor.status || "Active",
      });
      // console.log(vendor);
    }
  }, [vendor, isEdit]);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "vendor_name":
        if (!value) error = "Vendor name is required.";
        break;
      case "contact_person":
        if (!value) error = "Contact Person Name is required.";
        break;
      case "contact_number":
        if (!value) error = "Contact Number is required.";
        else if (!/^\d{10}$/.test(value))
          error = "Contact Number must be 10 digits.";
        break;
      case "gst_number":
        if (!value) error = "GST Number is required.";
        else if (!/^\d{15}$/.test(value))
          error = "GST Number must be 15 digits.";
        break;
      case "status":
        if (!value) error = "Status is required.";
        break;
      case "address":
        if (!value) error = "Address is required.";
        break;
      default:
        break;
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    setErrors({ ...errors, [id]: validateField(id, value) });
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const errorMsg = validateField(key, formData[key]);
      if (errorMsg) newErrors[key] = errorMsg;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = { ...formData, quantity: parseInt(formData.quantity) || 0 };
    const url = isEdit
      ? "http://localhost/Backend/api/Vendors/updateVendor.php"
      : "http://localhost/Backend/api/Vendors/addVendor.php";

    try {
      const res = await axios.post(url, payload, {
        validateStatus: () => true,
      });

      if (res.status === 200 || res.data.status === "success") {
        // console.log(res.data);
        onSuccess?.(); // trigger parent refresh if needed
        toast.success(
          isEdit ? "Vendor updated successfully!" : "Vendor added successfully!"
        );
        handleClose();
      } else if (res.data.message === "Vendor already exists") {
        toast.error("Vendor already exists!");
      } else {
        toast.error(res.data?.message || "Unexpected error occurred!");
        // console.error("Error response:", res.data?.details);
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error, please try again later.");
    }
  };

  const handleClose = () => {
    setFormData(defaultFormData);
    setErrors({});
    onClose(); // call parent close
  };

  return (
    <>
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {isEdit ? "Edit Vendor" : "Add Vendor"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                {[
                  "vendor_name",
                  "contact_person",
                  "contact_number",
                  "gst_number",
                ].map((field) => (
                  <div className="mb-3" key={field}>
                    <label htmlFor={field} className="col-form-label">
                      {field
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                      :
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors[field] ? "is-invalid" : ""
                      }`}
                      id={field}
                      value={formData[field]}
                      onChange={handleInputChange}
                    />
                    {errors[field] && (
                      <div className="invalid-feedback">{errors[field]}</div>
                    )}
                  </div>
                ))}

                <div className="mb-3">
                  <label htmlFor="address" className="col-form-label">
                    Address:
                  </label>
                  <textarea
                    className={`form-control ${
                      errors.address ? "is-invalid" : ""
                    }`}
                    id="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                  />
                  {errors.address && (
                    <div className="invalid-feedback">{errors.address}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="status" className="col-form-label">
                    Status:
                  </label>
                  <select
                    className={`form-select ${
                      errors.status ? "is-invalid" : ""
                    }`}
                    id="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Status --</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  {errors.status && (
                    <div className="invalid-feedback">{errors.status}</div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {isEdit ? "Update Vendor" : "Add Vendor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VendorModal;
