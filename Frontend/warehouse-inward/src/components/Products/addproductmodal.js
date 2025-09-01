import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AddProductModal = () => {
  const [formData, setFormData] = useState({
    product_code: "",
    hsn_code: "",
    product_name: "",
    category: "",
    quantity: 0,
    status: "Active",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    setErrors({ ...errors, [id]: "" }); 
  };

  // ✅ Validation function
  const validateForm = () => {
    let newErrors = {};

    if (!formData.product_code.trim()) {
      newErrors.product_code = "Product code is required";
    }
    if (!formData.hsn_code.trim()) {
      newErrors.hsn_code = "HSN code is required";
    } else if (!/^\d{6,8}$/.test(formData.hsn_code)) {
      newErrors.hsn_code = "HSN code must be 6–8 digits";
    }
    if (!formData.product_name.trim()) {
      newErrors.product_name = "Product name is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.status) {
      newErrors.status = "Status is required";
    }
    if (formData.quantity === "" || formData.quantity < 0) {
      newErrors.quantity = "Quantity must be 0 or greater";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // valid if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // stop if invalid
    }

    const payload = { ...formData, quantity: parseInt(formData.quantity) || 0 };

    try {
      const res = await axios.post(
        "http://localhost/Backend/api/Products/addProduct.php",
        payload
      );
      if (res.data.message === "Product already exists") {
        toast.error("Product already exists!");
        return;
      }
      toast.success("Product added successfully!");
    //   console.log(res.data);
      window.location.reload();
    } catch (error) {
    //   console.error(error);
      toast.error("Something went wrong while adding product!");
    }
  };

  return (
    <div
      className="modal fade"
      id="myModal"
      tabIndex="-1"
      aria-labelledby="productModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="productModalLabel">
              Product Details
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
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
                  className={`form-control ${errors.product_code ? "is-invalid" : ""}`}
                  id="product_code"
                  placeholder="e.g., P001"
                  value={formData.product_code}
                  onChange={handleInputChange}
                />
                {errors.product_code && (
                  <div className="invalid-feedback">{errors.product_code}</div>
                )}
              </div>

              {/* HSN Code */}
              <div className="mb-3">
                <label htmlFor="hsn_code" className="col-form-label">
                  HSN Code:
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.hsn_code ? "is-invalid" : ""}`}
                  id="hsn_code"
                  placeholder="e.g., 30049011"
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
                  className={`form-control ${errors.product_name ? "is-invalid" : ""}`}
                  id="product_name"
                  placeholder="e.g., Paracetamol Tablet"
                  value={formData.product_name}
                  onChange={handleInputChange}
                />
                {errors.product_name && (
                  <div className="invalid-feedback">{errors.product_name}</div>
                )}
              </div>

              {/* Category */}
              <div className="mb-3">
                <label htmlFor="category" className="col-form-label">
                  Category:
                </label>
                <select
                  className={`form-select ${errors.category ? "is-invalid" : ""}`}
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
                  className={`form-select ${errors.status ? "is-invalid" : ""}`}
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
                  className={`form-control ${errors.quantity ? "is-invalid" : ""}`}
                  id="quantity"
                  placeholder="e.g., 50"
                  onChange={handleInputChange}
                  value={formData.quantity}
                />
                {errors.quantity && (
                  <div className="invalid-feedback">{errors.quantity}</div>
                )}
              </div>

              {/* Submit */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button name="submit" className="btn btn-primary">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
