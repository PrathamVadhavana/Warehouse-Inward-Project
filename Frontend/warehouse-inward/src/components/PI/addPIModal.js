import { useState, useEffect } from "react";
import axios from "axios";

const AddPIModal = () => {
  const [formData, setFormData] = useState({
    supplier_id: "",
    grn_id: "",
    invoice_date: "",
    invoice_no: "",
    status: "Pending",
    total_amount: 0,
    items: [],
  });

  const [grns, setGRNs] = useState([]);
  const [products, setProducts] = useState([]);

  // 🔹 Fetch Pending GRNs when modal loads
  useEffect(() => {
    const fetchGRNs = async () => {
      try {
        const res = await axios.get(
          "http://localhost/Backend/api/PIs/getPendingGRNs.php"
        );
        if (res.data.status === "success") {
          setGRNs(res.data.pending_grns);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchGRNs();
    // console.log("GRNs fetched", grns);
  }, []);

  // 🔹 When GRN changes → fetch GRN Items
  useEffect(() => {
    if (!formData.grn_id) return;
    console.log("GRN changed", formData.grn_id);

    const fetchGRNItems = async () => {
      try {
        const res = await axios.post(
          "http://localhost/Backend/api/PIs/getGRNItems.php",
          { grn_id: formData.grn_id }
        );

        if (res.data.status === "success") {
          setFormData((prev) => ({
            ...prev,
            supplier_id: res.data.supplier_id,
            items: res.data.items.map((i) => ({
              product_id: i.product_id,
              quantity: i.received_qty || 0,
              rate: i.mrp || 0,
              amount: (i.received_qty || 0) * (i.mrp || 0),
            })),
            total_amount: res.data.items.reduce(
              (sum, i) => sum + (i.received_qty || 0) * (i.mrp || 0),
              0
            ),
          }));

          setProducts(res.data.items || []);
          // console.log("GRN Items fetched", res.data.items);
        }
        // console.log("GRN Items response", res.data.message);
      } catch (err) {
        console.error(err);
      }
    };

    fetchGRNItems();
  }, [formData.grn_id]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index][name] = Number(value);

    if (name === "quantity" || name === "rate") {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }

    const total = newItems.reduce((sum, i) => sum + i.amount, 0);
    setFormData({ ...formData, items: newItems, total_amount: total });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost/Backend/api/PIs/addPI.php",
        formData
      );
      if (res.data.status === "success") {
        alert("Purchase Invoice created successfully!");
        window.location.reload();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error creating PI");
    }
  };

  return (
    <div
      className="modal fade"
      id="addPIModal"
      tabIndex="-1"
      aria-labelledby="piModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="piModalLabel">
              Create Purchase Invoice
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
              {/* GRN Selection */}
              <div className="mb-3">
                <label htmlFor="grn_id" className="col-form-label">
                  Select GRN:
                </label>
                <select
                  className="form-select"
                  id="grn_id"
                  value={formData.grn_id}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select GRN --</option>
                  {grns.map((g) => (
                    <option key={g.grn_id} value={g.grn_id}>
                      GRN #{g.grn_id} (Supplier {g.supplier_id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Invoice Details */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="invoice_date" className="col-form-label">
                    Invoice Date:
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="invoice_date"
                    value={formData.invoice_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="invoice_no" className="col-form-label">
                    Invoice No:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="invoice_no"
                    value={formData.invoice_no}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Status Dropdown */}
              <div className="mb-3">
                <label htmlFor="status" className="col-form-label">
                  Status:
                </label>
                <select className="form-select" id="status" onChange={handleInputChange}>
                  <option value="">-- Select Status --</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              {/* Items Table */}
              <div className="mb-3">
                <label className="col-form-label">Invoice Items:</label>
                <div className="table-responsive">
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
                      {formData.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <select
                              className="form-select"
                              name="product_id"
                              value={item.product_id}
                              onChange={(e) => handleItemChange(index, e)}
                            >
                              <option value="">-- Select Product --</option>
                              {products.map((p) => (
                                <option
                                  key={p.product_id}
                                  value={p.product_id}
                                >
                                  {p.product_name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              name="quantity"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, e)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              name="rate"
                              value={item.rate}
                              onChange={(e) => handleItemChange(index, e)}
                            />
                          </td>
                          <td>{item.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <h5>Total Amount: {formData.total_amount}</h5>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Create PI
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPIModal;
