import { useState } from "react";
import axios from "axios";

const AddProductModal = () => {
    const [formData, setFormData] = useState({ product_code: '', hsn_code: '', product_name: '', category: '', quantity: 0 });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        console.log(formData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...formData, quantity: parseInt(formData.quantity) || 0 };
        try {
            const res = await axios.post(
                "http://localhost/Backend/api/Products/addProduct.php",
                payload
            );
            if (res.data.message === "Product already exists") {
                alert("Product already exists!");
                return;
            }
            alert("Product added successfully!");
            console.log(res.data);
            window.location.reload();
        } catch (error) {
            console.error(error);
        }

    }

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
                                <label htmlFor="product-code" className="col-form-label">
                                    Product Code:
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="product_code"
                                    placeholder="e.g., P001"
                                    value={formData.product_code ?? ''}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* HSN Code */}
                            <div className="mb-3">
                                <label htmlFor="hsn-code" className="col-form-label">
                                    HSN Code:
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="hsn_code"
                                    placeholder="e.g., 30049011"
                                    value={formData.hsn_code ?? ''}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Product Name */}
                            <div className="mb-3">
                                <label htmlFor="product-name" className="col-form-label">
                                    Product Name:
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="product_name"
                                    placeholder="e.g., Paracetamol Tablet"
                                    value={formData.product_name ?? ''}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Category Dropdown */}
                            <div className="mb-3">
                                <label htmlFor="category" className="col-form-label">
                                    Category:
                                </label>
                                <select className="form-select" id="category" onChange={handleInputChange}>
                                    <option value="">-- Select Category --</option>
                                    <option value="Liquid">Liquid</option>
                                    <option value="Tablet">Tablet</option>
                                    <option value="Capsule">Capsule</option>
                                </select>
                            </div>

                            {/* Price
              <div className="mb-3">
                <label htmlFor="price" className="col-form-label">
                  Price:
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="price"
                  placeholder="e.g., 120"
                  onChange={handleInputChange}
                />
              </div> */}

                            {/* Quantity */}
                            <div className="mb-3">
                                <label htmlFor="quantity" className="col-form-label">
                                    Quantity:
                                </label>
                                <input
                                    type="number"
                                    className="form-control"
                                    id="quantity"
                                    placeholder="e.g., 50"
                                    onChange={handleInputChange}
                                    value={formData.quantity ?? 0}
                                />
                            </div>
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