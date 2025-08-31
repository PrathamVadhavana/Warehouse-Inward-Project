import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EditPOModal from "./editPOModal";

const ListPOs = ({ filters, search }) => {
  const [pos, setPOs] = useState([]);
  const [editPO, setEditPO] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchPOs = async () => {
      try {
        const res = await fetch("http://localhost/Backend/api/POs/getPOs.php");
        const data = await res.json();
        console.log("Fetched POs:", data);
        setPOs(data || []);
      } catch (err) {
        console.error("Failed to fetch POs:", err);
        setPOs([]);
      }
    };
    fetchPOs();
  }, []);

  const handleEdit = (po) => {
    setEditPO(po);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditPO(null);
  };

  const handleDelete = (po) => {
    if (window.confirm(`Are you sure you want to delete PO #${po.po_id}?`)) {
      fetch("http://localhost/Backend/api/POs/deletePO.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ po_id: po.po_id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            alert("PO deleted successfully!");
            setPOs(pos.filter((p) => p.po_id !== po.po_id));
          } else alert("Failed to delete PO.");
        })
        .catch((err) => {
          console.error(err);
          alert("Error deleting PO.");
        });
    }
  };

  // Apply filters and search
  const filteredPOs = pos.filter((p) => {
    const statusMatch = filters.status ? p.status === filters.status : true;
    const supplierMatch = filters.supplier_id ? p.supplier_id === filters.supplier_id : true;

    let searchMatch = true;
    if (search?.text) {
      const text = search.text.toLowerCase();
      if (search.field === "po_id") searchMatch = p.po_id.toString().includes(text);
      if (search.field === "supplier_name") searchMatch = p.supplier_name?.toLowerCase().includes(text);
    }

    return statusMatch && supplierMatch && searchMatch;
  });

  return (
    <div className="table-responsive" style={{ maxHeight: "550px", overflowY: "auto" }}>
      <table className="table" style={{ fontSize: "15px "}}>
        <thead style={{ position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1 }}>
          <tr className="table-dark">
            <th className="align-middle text-center">PO ID</th>
            <th className="align-middle text-center">Supplier</th>
            <th className="align-middle text-center">PO Date</th>
            <th className="align-middle text-center">Expected Date</th>
            <th className="align-middle text-center">Status</th>
            <th className="align-middle text-center">Created At</th>
            <th className="align-middle text-center">Updated At</th>
            <th className="align-middle text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPOs.map((po) => (
            <tr key={po.po_id}>
              <td className="align-middle text-center">{po.po_id}</td>
              <td className="align-middle text-center">{po.supplier_id}</td>
              <td className="align-middle text-center">{po.po_date}</td>
              <td className="align-middle text-center">{po.expected_date}</td>
              <td
                className={`align-middle text-center ${
                  po.status === "Pending"
                    ? "table-warning"
                    : po.status === "Partially Received"
                    ? "table-info"
                    : "table-success"
                }`}
              >
                {po.status}
              </td>
              <td className="align-middle text-center">{new Date(po.created_at).toLocaleDateString()}</td>
              <td className="align-middle text-center">{new Date(po.updated_at).toLocaleDateString()}</td>
              <td className="align-middle text-center">
                <Link onClick={() => handleEdit(po)} className="me-3">
                  <i className="fa-regular fa-pen-to-square" style={{ color: "#23dd3cff" }}></i>
                </Link>
                <Link onClick={() => handleDelete(po)}>
                  <i className="fa-solid fa-trash" style={{ color: "#e50606" }}></i>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && <EditPOModal po={editPO} onClose={handleCloseModal} />}
    </div>
  );
};

export default ListPOs;
