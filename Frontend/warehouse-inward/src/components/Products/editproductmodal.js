import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditProductModal = ({ product, onClose }) => {
  const [formData, setFormData] = useState({
    product_code: "",
    hsn_code: "",
    product_name: "",
    category: "",
    quantity: 0,
    status: "Active",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        product_code: product.product_code || "",
        hsn_code: product.hsn_code || "",
        product_name: product.product_name || "",
        category: product.category || "",
        quantity: product.quantity || 0,
        status: product.status || "Active",
      });
    }
  }, [product]);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "product_code":
        if (!value) error = "Product code is required.";
        else if (value.length < 3) error = "Minimum 3 characters required.";
        break;
      case "hsn_code":
        if (!value) error = "HSN code is required.";
        else if (!/^\d+$/.test(value)) error = "HSN code must be numeric.";
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
        if (value < 0) error = "Quantity cannot be negative.";
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
    const errorMsg = validateField(id, value);
    setErrors({ ...errors, [id]: errorMsg });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validate all fields before submit
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const errorMsg = validateField(key, formData[key]);
      if (errorMsg) newErrors[key] = errorMsg;
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity) || 0,
      };

      const res = await axios.post(
        "http://localhost/Backend/api/Products/updateProduct.php",
        payload,
        { validateStatus: () => true } // allow custom handling
      );

      if (res.status === 404) {
        toast.error("Product does not exist!");
      } else if (res.status === 200) {
        toast.success("Product updated successfully!");
        setTimeout(() => {
          window.location.reload();
          onClose();
        }, 1500);
      } else {
        toast.error("Unexpected error occurred!");
      }
    } catch (err) {
      toast.error("Server error, please try again later.");
      console.error(err);
    }
  };

  if (!product) return null;

  return (
    <>
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Product</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                {/* Product Code */}
                <div className="mb-3">
                  <label htmlFor="product_code" className="col-form-label">
                    Product Code:
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.product_code ? "is-invalid" : ""
                    }`}
                    id="product_code"
                    value={formData.product_code}
                    onChange={handleInputChange}
                  />
                  {errors.product_code && (
                    <div className="invalid-feedback">
                      {errors.product_code}
                    </div>
                  )}
                </div>

                {/* HSN Code */}
                <div className="mb-3">
                  <label htmlFor="hsn_code" className="col-form-label">
                    HSN Code:
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.hsn_code ? "is-invalid" : ""
                    }`}
                    id="hsn_code"
                    value={formData.hsn_code}
                    onChange={handleInputChange}
                  />
                  {errors.hsn_code && (
                    <div className="invalid-feedback">{errors.hsn_code}</div>
                  )}
                </div>

                {/* Product Name */}
                <div className="mb-3">
                  <label htmlFor="product_name" className="col-form-label">
                    Product Name:
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.product_name ? "is-invalid" : ""
                    }`}
                    id="product_name"
                    value={formData.product_name}
                    onChange={handleInputChange}
                  />
                  {errors.product_name && (
                    <div className="invalid-feedback">
                      {errors.product_name}
                    </div>
                  )}
                </div>

                {/* Category */}
                <div className="mb-3">
                  <label htmlFor="category" className="col-form-label">
                    Category:
                  </label>
                  <select
                    className={`form-select ${
                      errors.category ? "is-invalid" : ""
                    }`}
                    id="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Category --</option>
                    <option value="Liquid">Liquid</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                  </select>
                  {errors.category && (
                    <div className="invalid-feedback">{errors.category}</div>
                  )}
                </div>

                {/* Status */}
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

                {/* Quantity */}
                <div className="mb-3">
                  <label htmlFor="quantity" className="col-form-label">
                    Quantity:
                  </label>
                  <input
                    type="number"
                    className={`form-control ${
                      errors.quantity ? "is-invalid" : ""
                    }`}
                    placeholder="0"
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
                    onClick={onClose}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Toaster */}
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar />
    </>
  );
};

export default EditProductModal;
