import { useState, useEffect } from "react";
import ReusableTable from "../../common/ReusableTable";

const ListPOItems = ({ search }) => {
    const [grnItems, setGRNItems] = useState([]);

    useEffect(() => {
        const fetchGRNItems = async () => {
            try {
                const res = await fetch("http://localhost/Backend/api/GRNs/listGRNItems.php");
                const data = await res.json();
                console.log("Fetched GRN Items:", data);
                setGRNItems(data);
            } catch (err) {
                console.error("Failed to fetch GRN items:", err);
                setGRNItems([]);
            }
        };
        fetchGRNItems();
    }, []);

    // Search only by po_id and medicine_id
    const filteredgrnItems = grnItems.filter((g) => {
        if (!search?.text) return true;
        const text = search.text.toLowerCase();

        if (search.field === "GRN Id") return String(g.grn_id).toLowerCase().includes(text);
        if (search.field === "GRN Item Id") return String(g.grn_item_id).toLowerCase().includes(text);

        return true;
    });

    const columns = [
    { header: "GRN Item ID", field: "grn_item_id" },
    { header: "GRN ID", field: "grn_id" },
    { header: "Product ID", field: "product_id" },
    { header: "Received Quantity", field: "received_qty" },
    { header: "Damaged Quantity", field: "damaged_qty" },
    { header: "Batch No.", field: "batch_no" },
    { header: "Expiry", field: "expiry" },
    { header: "MRP", field: "mrp" },
    {
      header: "Created At",
      field: "created_at",
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      header: "Updated At",
      field: "updated_at",
      render: (val) => new Date(val).toLocaleDateString(),
    },
  ];

    return (
        <div className="table-responsive" style={{ maxHeight: "550px", overflowY: "auto" }}>
            <ReusableTable columns={columns} data={filteredgrnItems} />
        </div>
    );
};

export default ListPOItems;
