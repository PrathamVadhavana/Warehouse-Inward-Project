import { useState, useEffect } from "react";
import axios from "axios";

const AddGRNModal = () => {
  const [formData, setFormData] = useState({
    po_id: "",
    grn_date: "",
    items: [{ medicine_id: "", received_qty: 0, damaged_qty: 0, mrp: 0 }],
  });

  const [pos, setPOs] = useState([]);
  const [products, setProducts] = useState([]);
  const [poItems, setPOItems] = useState([]); // store PO quantities for validation

  // Fetch POs on mount
  useEffect(() => {
    const fetchPOs = async () => {
      const res = await axios.get(
        "http://localhost/Backend/api/GRNs/getPendingPOs.php"
      );
      setPOs(res.data.pending_pos || []);
    };
    fetchPOs();
  }, []);

  // Fetch PO items & products when po_id changes
  useEffect(() => {
    if (!formData.po_id) return;

    const fetchPOData = async () => {
      try {
        // PO items (for quantity validation)
        const poRes = await axios.post(
          "http://localhost/Backend/api/POs/getPOItems.php",
          { po_id: formData.po_id }
        );
        const items = Array.isArray(poRes.data)
          ? poRes.data.map((item) => ({
            medicine_id: item.medicine_id,
            quantity: Number(item.quantity), // PO quantity
            previous_rate: Number(item.rate), // previous purchase rate for MRP
          }))
          : [];
        setPOItems(items);

        // Products available for selection
        const prodRes = await axios.post(
          "http://localhost/Backend/api/GRNs/getItemsforPO.php",
          { po_id: formData.po_id }
        );
        setProducts(prodRes.data || []);

        // Reset form items based on PO
        setFormData((prev) => ({
          ...prev,
          items: items.length
            ? items.map((i) => ({
              medicine_id: i.medicine_id,
              received_qty: 0,
              damaged_qty: 0,
              mrp: i.previous_rate,
            }))
            : [{ medicine_id: "", received_qty: 0, damaged_qty: 0, mrp: 0 }],
        }));
      } catch (err) {
        console.error(err);
      }
    };

    fetchPOData();
  }, [formData.po_id]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];

    const poItem = poItems.find(
      (p) => p.medicine_id === newItems[index].medicine_id
    );

    if (name === "received_qty") {
      if (poItem && Number(value) > poItem.quantity) {
        alert(`Received quantity cannot exceed PO quantity (${poItem.quantity})`);
        return;
      }
      newItems[index][name] = Number(value);
    } else if (name === "damaged_qty") {
      if (
        poItem &&
        Number(value) + newItems[index].received_qty > poItem.quantity
      ) {
        alert(
          `Total quantity (received + damaged) cannot exceed PO quantity (${poItem.quantity})`
        );
        return;
      }
      newItems[index][name] = Number(value);
    } else if (name === "mrp") {
      if (poItem && Number(value) > poItem.previous_rate * 1.2) {
        alert(
          `MRP cannot exceed 120% of previous purchase rate (${poItem.previous_rate})`
        );
        return;
      }
      newItems[index][name] = Number(value);
    }

    setFormData({ ...formData, items: newItems });
  };

  const addItemRow = () => {
    if (formData.items.length >= products.length) {
      alert("All medicines are already added.");
      return;
    }
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { medicine_id: "", received_qty: 0, damaged_qty: 0, mrp: 0 },
      ],
    });
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  // Calculate total amount = sum of (received_qty * mrp) for all items
  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + (Number(item.received_qty) || 0) * (Number(item.mrp) || 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const total_amount = calculateTotal();
    const payload = { ...formData, total_amount }; // include total

    try {
      const res = await axios.post(
        "http://localhost/Backend/api/GRNs/addGRN.php",
        payload
      );
      if (res.data.status === "success") {
        alert("GRN created successfully!");
        window.location.reload();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error creating GRN");
    }
  };


  return (
    <div
      className="modal fade"
      id="addGRNModal"
      tabIndex="-1"
      aria-labelledby="grnModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="grnModalLabel">
              Create GRN
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
              {/* PO Selection */}
              <div className="mb-3">
                <label htmlFor="po_id" className="col-form-label">
                  Purchase Order:
                </label>
                <select
                  className="form-select"
                  id="po_id"
                  value={formData.po_id}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select PO --</option>
                  {pos.map((p) => (
                    <option key={p.po_id} value={p.po_id}>
                      PO #{p.po_id} - {p.supplier_id}
                    </option>
                  ))}
                </select>
              </div>

              {/* GRN Date */}
              <div className="mb-3">
                <label htmlFor="grn_date" className="col-form-label">
                  GRN Date:
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="grn_date"
                  value={formData.grn_date}
                  onChange={handleInputChange}
                />
              </div>

              {/* Items Table */}
              <div className="mb-3">
                <label className="col-form-label">Items:</label>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Medicine Name</th>
                        <th>Received Qty</th>
                        <th>Damaged Qty</th>
                        <th>MRP</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => {
                        const selectedMedicines = formData.items
                          .filter((_, i) => i !== index)
                          .map((i) => i.medicine_id);

                        const availableProducts = products.filter(
                          (p) => !selectedMedicines.includes(p.product_id)
                        );

                        return (
                          <tr key={index}>
                            <td>
                              <select
                                className="form-select"
                                name="medicine_id"
                                value={item.medicine_id || ""}
                                onChange={(e) => {
                                  const newItems = [...formData.items];
                                  newItems[index].medicine_id = e.target.value;
                                  setFormData({ ...formData, items: newItems });
                                }}
                              >
                                <option value="">-- Select Medicine --</option>
                                {availableProducts.map((p) => (
                                  <option key={p.product_id} value={p.product_id}>
                                    {p.product_name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                name="received_qty"
                                value={item.received_qty || 0}
                                onChange={(e) => handleItemChange(index, e)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                name="damaged_qty"
                                value={item.damaged_qty || 0}
                                onChange={(e) => handleItemChange(index, e)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                name="mrp"
                                value={item.mrp || 0}
                                onChange={(e) => handleItemChange(index, e)}
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => removeItemRow(index)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    className="btn btn-secondary mt-2"
                    onClick={addItemRow}
                  >
                    Add Item
                  </button>
                </div>
              </div>
              {/* Total Amount */}
              <div className="mb-3 text-end">
                <h5>
                  Total Amount: <span className="fw-bold">₹{calculateTotal().toFixed(2)}</span>
                </h5>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Create GRN
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGRNModal;
