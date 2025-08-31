import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EditPIModal from "./EditPIModal";
import ReusableTable from "../common/ReusableTable";

const ListPIs = ({ filters, search }) => {
  const [pis, setPIs] = useState([]);
  const [editPI, setEditPI] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchPIs = async () => {
      try {
        const res = await fetch("http://localhost/Backend/api/PIs/getPIs.php");
        const data = await res.json();
        console.log("Fetched PIs:", data);

        if (Array.isArray(data)) setPIs(data);
        else if (Array.isArray(data?.data)) setPIs(data.data);
        else setPIs([]);
      } catch (err) {
        console.error("Failed to fetch PIs:", err);
        setPIs([]);
      }
    };
    fetchPIs();
  }, []);

  const handleEdit = (pi) => {
    setEditPI(pi);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditPI(null);
  };

  const handleDelete = (pi) => {
    if (window.confirm(`Are you sure you want to delete PI #${pi.pi_id}?`)) {
      fetch("http://localhost/Backend/api/PIs/deletePI.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pi_id: pi.pi_id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            alert("PI deleted successfully!");
            setPIs(pis.filter((g) => g.pi_id !== pi.pi_id));
          } else alert("Failed to delete PI.");
        })
        .catch((err) => {
          console.error(err);
          alert("Error deleting PI.");
        });
    }
  };

  // Filters + search
  const filteredPIs = pis.filter((pi) => {
    const statusMatch = filters.status ? pi.status === filters.status : true;

    let searchMatch = true;
    if (search?.text) {
      const text = search.text.toLowerCase();
      if (search.field === "pi_id") searchMatch = pi.pi_id.toString().includes(text);
      if (search.field === "grn_id") searchMatch = pi.grn_id.toString().includes(text);
      if (search.field === "invoice_no") searchMatch = pi.invoice_no?.toLowerCase().includes(text);
    }

    return statusMatch && searchMatch;
  });

  // Define columns for ReusableTable
  const columns = [
    { header: "PI ID", field: "pi_id" },
    { header: "Supplier ID", field: "supplier_id" },
    { header: "GRN Id", field: "grn_id" },
    { header: "Invoice Number", field: "invoice_no" },
    { header: "Invoice Date", field: "invoice_date" },
    { header: "Total Amount", field: "total_amount" },
    {
      header: "Status",
      field: "status",
      render: (value) => {
        let bg = "bg-secondary"; // fallback

        if (value === "Pending") bg = "bg-warning";
        else if (value === "Approved") bg = "bg-info";
        else if (value === "Rejected") bg = "bg-danger";
        else if (value === "Cancelled") bg = "bg-secondary";

        return (
          <span className={`px-2 py-1 rounded fw-medium text-white ${bg}`}>
            {value}
          </span>
        );
      },
    },
    {
      header: "Created At",
      field: "created_at",
      render: (value) => (value ? new Date(value).toLocaleDateString() : ""),
    },
    {
      header: "Updated At",
      field: "updated_at",
      render: (value) => (value ? new Date(value).toLocaleDateString() : ""),
    },
    {
      header: "Actions",
      field: "pi_id",
      render: (_, row) => (
        <>
          <Link onClick={() => handleEdit(row)} className="me-3">
            <i className="fa-regular fa-pen-to-square" style={{ color: "#23dd3cff" }}></i>
          </Link>
          <Link onClick={() => handleDelete(row)}>
            <i className="fa-solid fa-trash" style={{ color: "#e50606" }}></i>
          </Link>
        </>
      ),
    },
  ];

  return (
    <div className="table-responsive" style={{ maxHeight: "550px", overflowY: "auto" }}>
      <ReusableTable columns={columns} data={filteredPIs} />
      {showModal && <EditPIModal pi={editPI} onClose={handleCloseModal} />}
    </div>
  );
};

export default ListPIs;
