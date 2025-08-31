import { useState, useEffect } from "react";
import axios from "axios";

const EditGRNModal = ({ grn, onClose }) => {
  const [formData, setFormData] = useState({
    grn_id: grn?.grn_id || "",
    po_id: grn?.po_id || "",
    received_date: grn?.received_date || "",
    status: grn?.status || "Pending",
    items: [],
  });
  const [poItems, setPOItems] = useState([]); // For validation
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch GRN items & PO items
  useEffect(() => {
    if (!grn?.grn_id) return;

    const fetchData = async () => {
      try {
        // 1️⃣ Fetch GRN items
        const grnRes = await axios.post(
          "http://localhost/Backend/api/GRNs/fillGRNItemsforEdit.php",
          { grn_id: grn.grn_id }
        );
        const items = Array.isArray(grnRes.data) ? grnRes.data : [];
        setFormData((prev) => ({ ...prev, items }));
        // console.log("GRN Items:", grnRes.data);

        // 2️⃣ Fetch PO items (for quantity validation)
        const poRes = await axios.post(
          "http://localhost/Backend/api/POs/getPOItems.php",
          { po_id: grn.po_id }
        );
        const poItemsData = Array.isArray(poRes.data)
          ? poRes.data.map((i) => ({
              medicine_id: i.medicine_id,
              quantity: Number(i.quantity),
              previous_rate: Number(i.rate),
            }))
          : [];
        setPOItems(poItemsData);

        // 3️⃣ Fetch products list
        const prodRes = await axios.post(
          "http://localhost/Backend/api/GRNs/getItemsforPO.php",
          { po_id: grn.po_id }
        );
        setProducts(prodRes.data || []);
      } catch (err) {
        console.error("Error fetching GRN/PO items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [grn]);

  // Handle item input changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    const poItem = poItems.find(
      (p) => p.medicine_id === updatedItems[index].medicine_id
    );

    if (field === "received_qty") {
      value = Number(value);
      if (poItem && value + (updatedItems[index].damaged_qty || 0) > poItem.quantity) {
        alert(`Total quantity cannot exceed PO quantity (${poItem.quantity})`);
        return;
      }
    }

    if (field === "damaged_qty") {
      value = Number(value);
      if (poItem && value + (updatedItems[index].received_qty || 0) > poItem.quantity) {
        alert(`Total quantity cannot exceed PO quantity (${poItem.quantity})`);
        return;
      }
    }

    if (field === "mrp") {
      value = Number(value);
      if (poItem && value > poItem.previous_rate * 1.2) {
        alert(`MRP cannot exceed 120% of previous purchase rate (${poItem.previous_rate})`);
        return;
      }
    }

    updatedItems[index][field] = value;
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  // Save updated GRN
  const handleSave = async () => {
    try {
      const res = await axios.post(
        "http://localhost/Backend/api/GRNs/updateGRN.php",
        formData
      );
      if (res.data.status === "success") {
        alert("GRN updated successfully!");
        onClose();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating GRN");
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
            <h5 className="modal-title">Edit GRN #{formData.grn_id}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Received Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.received_date}
                onChange={(e) =>
                  setFormData({ ...formData, received_date: e.target.value })
                }
              />
            </div>

            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Received Qty</th>
                  <th>Damaged Qty</th>
                  <th>Batch No</th>
                  <th>Expiry</th>
                  <th>MRP</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, idx) => {
                  const availableProducts = products.filter(
                    (p) =>
                      p.product_id === item.medicine_id ||
                      !formData.items.some((i, iIdx) => i.medicine_id === p.product_id && iIdx !== idx)
                  );

                  return (
                    <tr key={idx}>
                      <td>
                        <select
                          className="form-select"
                          value={item.product_id || ""}
                          onChange={(e) =>
                            handleItemChange(idx, "medicine_id", e.target.value)
                          }
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
                          value={item.received_qty}
                          onChange={(e) =>
                            handleItemChange(idx, "received_qty", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={item.damaged_qty}
                          onChange={(e) =>
                            handleItemChange(idx, "damaged_qty", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={item.batch_no || ""}
                          onChange={(e) =>
                            handleItemChange(idx, "batch_no", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          className="form-control"
                          value={item.expiry || ""}
                          onChange={(e) =>
                            handleItemChange(idx, "expiry", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={item.mrp}
                          onChange={(e) =>
                            handleItemChange(idx, "mrp", e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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

export default EditGRNModal;
