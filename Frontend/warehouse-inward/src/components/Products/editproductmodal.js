import React, { useState, useEffect } from "react";
import axios from "axios";

const EditProductModal = ({ product, onClose }) => {
  const [formData, setFormData] = useState({
    product_code: "",
    hsn_code: "",
    product_name: "",
    category: "",
    quantity: 0,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        product_code: product.product_code || "",
        hsn_code: product.hsn_code || "",
        product_name: product.product_name || "",
        category: product.category || "",
        quantity: product.quantity || 0,
      });
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, quantity: parseInt(formData.quantity) || 0 };
      const res = await axios.post("http://localhost/Backend/api/Products/updateProduct.php", payload);
      if (res.data.message === "Product does not exists") {
        alert("Product does not exist!");
        return;
      }
      alert("Product updated successfully!");
      window.location.reload();
      onClose(); // close modal
    } catch (err) {
      console.error(err);
    }
  };

  if (!product) return null; // do not render modal if no product selected

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Product</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              {/* Product Code */}
              <div className="mb-3">
                <label htmlFor="product_code" className="col-form-label">Product Code:</label>
                <input
                  type="text"
                  className="form-control"
                  id="product_code"
                  value={formData.product_code}
                  onChange={handleInputChange}
                />
              </div>

              {/* HSN Code */}
              <div className="mb-3">
                <label htmlFor="hsn_code" className="col-form-label">HSN Code:</label>
                <input
                  type="text"
                  className="form-control"
                  id="hsn_code"
                  value={formData.hsn_code}
                  onChange={handleInputChange}
                />
              </div>

              {/* Product Name */}
              <div className="mb-3">
                <label htmlFor="product_name" className="col-form-label">Product Name:</label>
                <input
                  type="text"
                  className="form-control"
                  id="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                />
              </div>

              {/* Category */}
              <div className="mb-3">
                <label htmlFor="category" className="col-form-label">Category:</label>
                <select
                  className="form-select"
                  id="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select Category --</option>
                  <option value="Liquid">Liquid</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                </select>
              </div>

              {/* Quantity */}
              <div className="mb-3">
                <label htmlFor="quantity" className="col-form-label">Quantity:</label>
                <input
                  type="number"
                  className="form-control"
                  id="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                <button type="submit" className="btn btn-primary">Update Product</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
