import { useState, useEffect } from "react";

const ListPOItems = ({ search }) => {
    const [poItems, setPOItems] = useState([]);

    useEffect(() => {
        const fetchPOItems = async () => {
            try {
                const res = await fetch("http://localhost/Backend/api/POs/listPOItems.php");
                const data = await res.json();
                console.log("Fetched PO Items:", data);
                setPOItems(data);
            } catch (err) {
                console.error("Failed to fetch purchase order items:", err);
                setPOItems([]);
            }
        };
        fetchPOItems();
    }, []);

    // Search only by po_id and medicine_id
    const filteredpoItems = poItems.filter((p) => {
        if (!search?.text) return true; 
        const text = search.text.toLowerCase();

        if (search.field === "PO Id") return String(p.po_id).toLowerCase().includes(text);
        if (search.field === "Medicine Id") return String(p.medicine_id).toLowerCase().includes(text);

        return true;
    });

    return (
        <div className="table-responsive" style={{ maxHeight: "550px", overflowY: "auto" }}>
            <table className="table">
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1 }}>
                    <tr className="table-dark">
                        <th className="align-middle text-center">ID</th>
                        <th className="align-middle text-center">PO ID</th>
                        <th className="align-middle text-center">Medicine ID</th>
                        <th className="align-middle text-center">Quantity</th>
                        <th className="align-middle text-center">Rate</th>
                        <th className="align-middle text-center">Created At</th>
                        <th className="align-middle text-center">Updated At</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredpoItems.map(item => (
                        <tr key={item.id}>
                            <td className="align-middle text-center">{item.id}</td>
                            <td className="align-middle text-center">{item.po_id}</td>
                            <td className="align-middle text-center">{item.medicine_id}</td>
                            <td className="align-middle text-center">{item.quantity}</td>
                            <td className="align-middle text-center">{item.rate}</td>
                            <td className="align-middle text-center">{item.created_at}</td>
                            <td className="align-middle text-center">{item.updated_at}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ListPOItems;
