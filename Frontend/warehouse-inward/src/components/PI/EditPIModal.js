import { useState, useEffect } from "react";
import axios from "axios";

const EditPIModal = ({ pi, onClose }) => {
  const [formData, setFormData] = useState({
    pi_id: pi?.pi_id || "",
    grn_id: pi?.grn_id || "",
    supplier_id: pi?.supplier_id || "",
    invoice_date: pi?.invoice_date || "",
    invoice_no: pi?.invoice_no || "",
    total_amount: pi?.total_amount || 0,
    status: pi?.status || "Pending",
    items: [],
  });

  const [grnItems, setGrnItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch PI items + GRN items
  useEffect(() => {
    if (!pi?.pi_id) return;

    const fetchData = async () => {
      try {
        // 1️⃣ Fetch PI items
        const piRes = await axios.post(
          "http://localhost/Backend/api/PIs/fillPIItemsForEdit.php",
          { pi_id: pi.pi_id }
        );
        const items = Array.isArray(piRes.data) ? piRes.data : [];
        setFormData((prev) => ({ ...prev, items }));

        // 2️⃣ Fetch GRN items for this PI (to validate / re-pick if needed)
        const grnRes = await axios.post(
          "http://localhost/Backend/api/PIs/getGRNItems.php",
          { grn_id: pi.grn_id }
        );
        setGrnItems(grnRes.data.items || []);
      } catch (err) {
        console.error("Error fetching PI/GRN items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pi]);

  // Handle item input change
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = field === "quantity" || field === "rate" ? Number(value) : value;
    updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;

    // Recalculate total
    const total = updatedItems.reduce((sum, i) => sum + (i.amount || 0), 0);

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
      total_amount: total,
    }));
  };

  // Save PI
  const handleSave = async () => {
    try {
      const res = await axios.post(
        "http://localhost/Backend/api/PIs/updatePI.php",
        formData
      );
      if (res.data.status === "success") {
        alert("PI updated successfully!");
        window.location.reload();
        onClose();
      } else {
        alert(res.data.message || "Error saving PI");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating PI");
    }
  };

  if (loading) return null;

  return (
    <div
      className="modal show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit PI #{formData.pi_id}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {/* Invoice Details */}
            <div className="row mb-3">
              <div className="col">
                <label className="form-label">Invoice No</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.invoice_no}
                  onChange={(e) =>
                    setFormData({ ...formData, invoice_no: e.target.value })
                  }
                />
              </div>
              <div className="col">
                <label className="form-label">Invoice Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.invoice_date}
                  onChange={(e) =>
                    setFormData({ ...formData, invoice_date: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Status Dropdown */}
              <div className="mb-3">
                <label htmlFor="status" className="col-form-label">
                  Status:
                </label>
                <select className="form-select" id="status" onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  } value={formData.status}>
                  <option value="">-- Select Status --</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              
            {/* Items Table */}
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, idx) => {
                  const availableProducts = grnItems.filter(
                    (p) =>
                      p.product_id === item.product_id ||
                      !formData.items.some(
                        (i, iIdx) => i.product_id === p.product_id && iIdx !== idx
                      )
                  );

                  return (
                    <tr key={idx}>
                      <td>
                        <select
                          className="form-select"
                          value={item.product_id || ""}
                          onChange={(e) =>
                            handleItemChange(idx, "product_id", e.target.value)
                          }
                        >
                          <option value="">-- Select Product --</option>
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
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(idx, "quantity", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={item.rate}
                          onChange={(e) =>
                            handleItemChange(idx, "rate", e.target.value)
                          }
                        />
                      </td>
                      <td>{item.amount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Total */}
            <div className="text-end fw-bold">
              Total: ₹{Number(formData.total_amount || 0).toFixed(2)}
            </div>

          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPIModal;
