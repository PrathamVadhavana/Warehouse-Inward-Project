import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

const EditPOModal = ({ po, onClose }) => {
  const [formData, setFormData] = useState({
    po_id: "",
    supplier_id: "",
    po_date: "",
    expected_date: "",
    status: "Pending",
    items: [{ medicine_id: "", quantity: 0, rate: 0 }],
  });

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  // Fetch suppliers and products once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersRes, productsRes] = await Promise.all([
          axios.get("http://localhost/Backend/api/Vendors/getVendors.php"),
          axios.get("http://localhost/Backend/api/Products/getProducts.php"),
        ]);

        setSuppliers(suppliersRes.data || []);
        setProducts(productsRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  // Fetch PO items when po changes
  useEffect(() => {
    const fetchPOItems = async () => {
      if (!po) return;

      try {
        const res = await axios.post("http://localhost/Backend/api/POs/getPOItems.php", {
          po_id: po.po_id,
        });

        let items = [];
        if (Array.isArray(res.data)) {
          items = res.data.map((item) => ({
            medicine_id: item.medicine_id,
            quantity: Number(item.quantity),
            rate: Number(item.rate),
          }));
        }

        setFormData({
          po_id: po.po_id,
          supplier_id: po.supplier_id || "",
          po_date: po.po_date || "",
          expected_date: po.expected_date || "",
          status: po.status || "Pending",
          items: items.length ? items : [{ medicine_id: "", quantity: 0, rate: 0 }],
        });
      } catch (err) {
        console.error("Error fetching PO items:", err);
      }
    };

    fetchPOItems();
  }, [po]);

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

  const handleItemSelect = (index, selected) => {
    const newItems = [...formData.items];
    newItems[index].medicine_id = selected ? selected.value : "";
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
      const res = await axios.post("http://localhost/Backend/api/POs/updatePO.php", formData);
      if (res.data.status === "success") {
        alert("PO updated successfully!");
        onClose();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating PO");
    }
  };

  if (!po) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Edit Purchase Order #{po.po_id}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <form onSubmit={handleSubmit}>
              {/* Supplier */}
              <div className="mb-3">
                <label htmlFor="supplier_id" className="col-form-label fw-bold">
                  Supplier:
                </label>
                <select
                  className="form-select"
                  id="supplier_id"
                  value={formData.supplier_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select Supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s.vendor_id} value={s.vendor_id}>
                      {s.vendor_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="row">
                {/* PO Date */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="po_date" className="col-form-label fw-bold">
                    PO Date:
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="po_date"
                    value={formData.po_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Expected Date */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="expected_date" className="col-form-label fw-bold">
                    Expected Date:
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="expected_date"
                    value={formData.expected_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Status */}
              <div className="mb-3">
                <label htmlFor="status" className="col-form-label fw-bold">
                  Status:
                </label>
                <select
                  className="form-select"
                  id="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="Partially Received">Partially Received</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Items Table */}
              <div className="mb-3">
                <label className="col-form-label fw-bold">Items:</label>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <Select
                              options={products.map((p) => ({
                                value: p.product_id,
                                label: p.product_name,
                              }))}
                              value={
                                products.find((p) => p.product_id === item.medicine_id)
                                  ? {
                                    value: item.medicine_id,
                                    label: products.find((p) => p.product_id === item.medicine_id).product_name,
                                  }
                                  : null
                              }
                              onChange={(selected) => handleItemSelect(index, selected)}
                              placeholder="Select Medicine..."
                              isClearable
                              required
                            />

                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              name="quantity"
                              placeholder="Quantity"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, e)}
                              min="1"
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              name="rate"
                              placeholder="Rate"
                              value={item.rate}
                              onChange={(e) => handleItemChange(index, e)}
                              min="0"
                              step="0.01"
                              required
                            />
                          </td>
                          <td className="align-middle">
                            ${(item.quantity * item.rate).toFixed(2)}
                          </td>
                          <td className="align-middle">
                            {formData.items.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => removeItemRow(index)}
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" className="btn btn-secondary mt-2" onClick={addItemRow}>
                  <i className="bi bi-plus-circle me-2"></i>Add Item
                </button>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPOModal;
