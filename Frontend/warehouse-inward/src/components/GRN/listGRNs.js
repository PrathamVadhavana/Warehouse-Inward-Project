import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EditGRNModal from "./editGRNModal";

const ListGRNs = ({ filters, search }) => {
  const [grns, setGRNs] = useState([]);
  const [editGRN, setEditGRN] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
  const fetchGRNs = async () => {
    try {
      const res = await fetch("http://localhost/Backend/api/GRNs/getGRNs.php");
      const data = await res.json();
      console.log("Fetched GRNs:", data);

      // Ensure data is an array
      if (Array.isArray(data)) {
        setGRNs(data);
      } else if (Array.isArray(data?.data)) {
        setGRNs(data.data);
      } else {
        setGRNs([]);
      }
    } catch (err) {
      console.error("Failed to fetch GRNs:", err);
      setGRNs([]);
    }
  };
  fetchGRNs();
}, []);


  const handleEdit = (grn) => {
    setEditGRN(grn);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditGRN(null);
  };

  const handleDelete = (grn) => {
    if (window.confirm(`Are you sure you want to delete GRN #${grn.grn_id}?`)) {
      fetch("http://localhost/Backend/api/GRNs/deleteGRN.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grn_id: grn.grn_id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            alert("GRN deleted successfully!");
            setGRNs(grns.filter((g) => g.grn_id !== grn.grn_id));
          } else alert("Failed to delete GRN.");
        })
        .catch((err) => {
          console.error(err);
          alert("Error deleting GRN.");
        });
    }
  };

  // Apply filters and search
  const filteredGRNs = grns.filter((g) => {
    const statusMatch = filters.status ? g.status === filters.status : true;

    let searchMatch = true;
    if (search?.text) {
      const text = search.text.toLowerCase();
      if (search.field === "grn_id") searchMatch = g.grn_id.toString().includes(text);
      if (search.field === "po_id") searchMatch = g.po_id.toString().includes(text);
    }

    return statusMatch && searchMatch;
  });

  return (
    <div className="table-responsive" style={{ maxHeight: "550px", overflowY: "auto" }}>
      <table className="table">
        <thead style={{ position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1 }}>
          <tr className="table-dark" style={{fontSize: "14px"}}>
            <th className="align-middle text-center">GRN ID</th>
            <th className="align-middle text-center">PO ID</th>
            <th className="align-middle text-center">Received Date</th>
            <th className="align-middle text-center">Status</th>
            <th className="align-middle text-center">Created At</th>
            <th className="align-middle text-center">Updated At</th>
            <th className="align-middle text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredGRNs.map((grn) => (
            <tr key={grn.grn_id}>
              <td className="align-middle text-center">{grn.grn_id}</td>
              <td className="align-middle text-center">{grn.po_id}</td>
              <td className="align-middle text-center">{grn.received_date}</td>
              <td
                className={`align-middle text-center ${
                  grn.status === "Pending"
                    ? "table-warning"
                    : grn.status === "Partially Received"
                    ? "table-info"
                    : "table-success"
                }`}
              >
                {grn.status}
              </td>
              <td className="align-middle text-center">{grn.created_at}</td>
              <td className="align-middle text-center">{grn.updated_at}</td>
              <td className="align-middle text-center">
                <Link onClick={() => handleEdit(grn)} className="me-3">
                  <i className="fa-regular fa-pen-to-square" style={{ color: "#23dd3cff" }}></i>
                </Link>
                <Link onClick={() => handleDelete(grn)}>
                  <i className="fa-solid fa-trash" style={{ color: "#e50606" }}></i>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && <EditGRNModal grn={editGRN} onClose={handleCloseModal} />}
    </div>
  );
};

export default ListGRNs;
