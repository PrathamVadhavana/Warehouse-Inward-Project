import React, { useState, useEffect } from "react";
import axios from "axios";

const EditVendorModal = ({ vendor, onClose }) => {
  const [formData, setFormData] = useState({
    vendor_code: "",
    contact_person: "",
    contact_number: "",
    vendor_name: "",
    address: "",
    gst_number: "",
    status: "Active", // default to Active
  });

  useEffect(() => {
    if (vendor) {
      setFormData({
        vendor_code: vendor.vendor_code || "",
        contact_person: vendor.contact_person || "",
        contact_number: vendor.contact_number || "",
        vendor_name: vendor.vendor_name || "",
        address: vendor.address || "",
        gst_number: vendor.gst_number || "",
        status: vendor.status || "",
      });
    }
  }, [vendor]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData }; // send status as string
      const res = await axios.post(
        "http://localhost/Backend/api/Vendors/updateVendor.php",
        payload
      );
      alert(res.data.message);
      window.location.reload();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!vendor) return null;

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Vendor</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              {/* Vendor Code */}
              <div className="mb-3">
                <label htmlFor="vendor_code" className="form-label">
                  Vendor Code:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="vendor_code"
                  value={formData.vendor_code}
                  onChange={handleInputChange}
                />
              </div>

              {/* Contact Person */}
              <div className="mb-3">
                <label htmlFor="contact_person" className="form-label">
                  Contact Person:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={handleInputChange}
                />
              </div>

              {/* Contact Number */}
              <div className="mb-3">
                <label htmlFor="contact_number" className="form-label">
                  Contact Number:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="contact_number"
                  value={formData.contact_number}
                  onChange={handleInputChange}
                />
              </div>

              {/* Vendor Name */}
              <div className="mb-3">
                <label htmlFor="vendor_name" className="form-label">
                  Vendor Name:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="vendor_name"
                  value={formData.vendor_name}
                  onChange={handleInputChange}
                />
              </div>

              {/* Address */}
              <div className="mb-3">
                <label htmlFor="address" className="form-label">
                  Address:
                </label>
                <textarea
                  className="form-control"
                  id="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Vendor address..."
                />
              </div>

              {/* GST Number */}
              <div className="mb-3">
                <label htmlFor="gst_number" className="form-label">
                  GST Number:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="gst_number"
                  value={formData.gst_number}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="status" className="form-label">Status:</label>
                <select
                  className="form-select"
                  id="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditVendorModal;
