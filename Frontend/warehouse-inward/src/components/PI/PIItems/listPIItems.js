import { useState, useEffect } from "react";
import ReusableTable from "../../common/ReusableTable";

const ListPIItems = ({ search }) => {
  const [piItems, setPIItems] = useState([]);

  useEffect(() => {
    const fetchPIItems = async () => {
      try {
        const res = await fetch("http://localhost/Backend/api/PIs/listPIItems.php");
        const data = await res.json();
        console.log("Fetched PI Items:", data);
        setPIItems(data);
      } catch (err) {
        console.error("Failed to fetch PI items:", err);
        setPIItems([]);
      }
    };
    fetchPIItems();
  }, []);

  // 🔍 Apply search filter
  const filteredPIItems = piItems.filter((item) => {
    if (!search?.text) return true;
    const text = search.text.toLowerCase();

    if (search.field === "PI Id") return String(item.pi_id).toLowerCase().includes(text);
    if (search.field === "PI Item Id") return String(item.id).toLowerCase().includes(text);
    if (search.field === "Product Id") return String(item.product_id).toLowerCase().includes(text);
    if (search.field === "Invoice No") return String(item.invoice_no || "").toLowerCase().includes(text);

    return true;
  });

  // 📋 Table columns
  const columns = [
    { header: "PI Item ID", field: "id" },
    { header: "PI ID", field: "pi_id" },
    { header: "Product ID", field: "product_id" },
    { header: "Quantity", field: "quantity" },
    { header: "Rate", field: "rate" },
    { header: "Amount", field: "amount" },
    {
      header: "Created At",
      field: "created_at",
      render: (val) => (val ? new Date(val).toLocaleDateString() : "-"),
    },
    {
      header: "Updated At",
      field: "updated_at",
      render: (val) => (val ? new Date(val).toLocaleDateString() : "-"),
    },
  ];

  return (
    <div className="table-responsive" style={{ maxHeight: "550px", overflowY: "auto" }}>
      <ReusableTable columns={columns} data={filteredPIItems} />
    </div>
  );
};

export default ListPIItems;
