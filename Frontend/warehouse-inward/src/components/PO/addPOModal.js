import { useState, useEffect } from "react";
import axios from "axios";
import Select from 'react-select';

const AddPOModal = () => {
    const [formData, setFormData] = useState({
        supplier_id: "",
        po_date: "",
        expected_date: "",
        status: "Pending",
        items: [{ medicine_id: "", quantity: 0, rate: 0 }],
    });

    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);

    // Fetch suppliers and products on mount
    useEffect(() => {
        const fetchSuppliers = async () => {
            const res = await axios.get("http://localhost/Backend/api/Vendors/getVendors.php");
            setSuppliers(res.data || []);
        };
        const fetchProducts = async () => {
            const res = await axios.get("http://localhost/Backend/api/Products/getProducts.php");
            setProducts(res.data || []);
        };
        fetchSuppliers();
        fetchProducts();
    }, []);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...formData.items];
        newItems[index][name] = name === "quantity" || name === "rate" ? Number(value) : value;
        setFormData({ ...formData, items: newItems });
    };

    const addItemRow = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { medicine_id: "", quantity: 0, rate: 0 }],
        });
    };

    const removeItemRow = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                "http://localhost/Backend/api/POs/addPO.php",
                formData
            );
            if (res.data.status === "success") {
                alert("Purchase Order added successfully!");
                window.location.reload();
            } else {
                alert(res.data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Error adding PO");
        }
    };

    return (
        <div
            className="modal fade"
            id="addPOModal"
            tabIndex="-1"
            aria-labelledby="poModalLabel"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-xl">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="poModalLabel">Create Purchase Order</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            {/* Supplier */}
                            <div className="mb-3">
                                <label htmlFor="supplier_id" className="col-form-label">Supplier:</label>
                                <select
                                    className="form-select"
                                    id="supplier_id"
                                    value={formData.supplier_id}
                                    onChange={handleInputChange}
                                >
                                    <option value="">-- Select Supplier --</option>
                                    {suppliers.map(s => (
                                        <option key={s.vendor_id} value={s.vendor_id}>{s.vendor_name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* PO Date */}
                            <div className="mb-3">
                                <label htmlFor="po_date" className="col-form-label">PO Date:</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    id="po_date"
                                    value={formData.po_date}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Expected Date */}
                            <div className="mb-3">
                                <label htmlFor="expected_date" className="col-form-label">Expected Date:</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    id="expected_date"
                                    value={formData.expected_date}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Items Table */}
                            <div className="mb-3">
                                <label className="col-form-label">Items:</label>
                                {formData.items.map((item, index) => (
                                    <div className="row mb-2" key={index}>
                                        <div className="col">
                                            <Select
                                                options={products.map(p => ({ value: p.product_id, label: p.product_name }))}
                                                value={products
                                                    .filter(p => p.product_id === item.medicine_id)
                                                    .map(p => ({ value: p.product_id, label: p.product_name }))[0] || null}
                                                onChange={(selected) => {
                                                    const newItems = [...formData.items];
                                                    newItems[index].medicine_id = selected ? selected.value : "";
                                                    setFormData({ ...formData, items: newItems });
                                                }}
                                                placeholder="Select Medicine..."
                                                isClearable
                                            />
                                        </div>
                                        <div className="col">
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="quantity"
                                                placeholder="Quantity"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, e)}
                                            />
                                        </div>
                                        <div className="col">
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="rate"
                                                placeholder="Rate"
                                                value={item.rate}
                                                onChange={(e) => handleItemChange(index, e)}
                                            />
                                        </div>
                                        <div className="col-auto">
                                            <button type="button" className="btn btn-danger" onClick={() => removeItemRow(index)}>Remove</button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-secondary mt-2" onClick={addItemRow}>Add Item</button>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="submit" className="btn btn-primary">Create PO</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddPOModal;
