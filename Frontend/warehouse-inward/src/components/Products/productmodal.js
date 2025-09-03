import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductModal = ({ product, onClose, onSuccess }) => {
  const isEdit = !!product;
  const defaultFormData = {
    hsn_code: "",
    product_name: "",
    category: "",
    quantity: 0,
    status: "Active",
  };
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setFormData({
        hsn_code: product.hsn_code || "",
        product_name: product.product_name || "",
        category: product.category || "",
        quantity: product.quantity || 0,
        status: product.status || "Active",
      });
      // console.log(product);
    }
  }, [product, isEdit]);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "hsn_code":
        if (!value) error = "HSN code is required.";
        else if (!/^\d{6,8}$/.test(value))
          error = "HSN code must be 6–8 digits.";
        break;
      case "product_name":
        if (!value) error = "Product name is required.";
        break;
      case "category":
        if (!value) error = "Category is required.";
        break;
      case "status":
        if (!value) error = "Status is required.";
        break;
      case "quantity":
        if (value === "" || value < 0) error = "Quantity must be 0 or greater.";
        else if (!Number.isInteger(Number(value)))
          error = "Quantity must be an integer.";
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
      ? "http://localhost/Backend/api/Products/updateProduct.php"
      : "http://localhost/Backend/api/Products/addProduct.php";

    try {
      const res = await axios.post(url, payload, {
        validateStatus: () => true,
      });

      if (res.status === 200 || res.data.status === "success") {
        // console.log(res.data);
        onSuccess?.(); // trigger parent refresh if needed
        toast.success(
          isEdit
            ? "Product updated successfully!"
            : "Product added successfully!"
        );
        handleClose();
      } else if (res.data.message === "Product already exists") {
        toast.error("Product already exists!");
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
    setShowCategoryDropdown(false);
    onClose(); // call parent close
  };

  return (
    <>
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {isEdit ? "Edit Product" : "Add Product"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                {["hsn_code", "product_name"].map((field) => (
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
                  <label htmlFor="category" className="col-form-label">
                    Category:
                  </label>
                  <select
                    className={`form-select ${
                      errors.category ? "is-invalid" : ""
                    }`}
                    id="category"
                    value={
                      ["Liquid", "Tablet", "Capsule"].includes(
                        formData.category
                      )
                        ? formData.category
                        : "Other"
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "Other") {
                        setShowCategoryDropdown(true);
                        // keep existing custom value if already present
                        if (
                          ["Liquid", "Tablet", "Capsule"].includes(
                            formData.category
                          )
                        ) {
                          setFormData({ ...formData, category: "" });
                        }
                      } else {
                        setShowCategoryDropdown(false);
                        setFormData({ ...formData, category: value });
                      }
                    }}
                  >
                    <option value="">-- Select Category --</option>
                    <option value="Liquid">Liquid</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Other">Other (Mention it)</option>
                  </select>

                  {showCategoryDropdown ||
                  (!["Liquid", "Tablet", "Capsule"].includes(
                    formData.category
                  ) &&
                    formData.category) ? (
                    <div className="mt-2">
                      <input
                        type="text"
                        className={`form-control ${
                          errors.category ? "is-invalid" : ""
                        }`}
                        id="category-input"
                        placeholder="Enter custom category"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                      />
                      {errors.category && (
                        <div className="invalid-feedback">
                          {errors.category}
                        </div>
                      )}
                    </div>
                  ) : null}
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

                <div className="mb-3">
                  <label htmlFor="quantity" className="col-form-label">
                    Quantity:
                  </label>
                  <input
                    type="number"
                    className={`form-control ${
                      errors.quantity ? "is-invalid" : ""
                    }`}
                    id="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                  />
                  {errors.quantity && (
                    <div className="invalid-feedback">{errors.quantity}</div>
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
                    {isEdit ? "Update Product" : "Add Product"}
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

export default ProductModal;
