import { useState, useEffect } from "react";
import EditVendorModal from "./editvendormodal";

const ListVendors = ({ filters }) => {
    const [vendors, setVendors] = useState([]);
    const [editVendor, setEditVendor] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const res = await fetch("http://localhost/Backend/api/Vendors/getvendors.php");
                const data = await res.json();
                setVendors(data);
            } catch (err) {
                console.error("Failed to fetch vendors:", err);
                setVendors([]);
            }
        };
        fetchVendors();
    }, []);

    const handleEdit = (vendor) => {
        setEditVendor(vendor);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditVendor(null);
    };

    const handleDelete = (vendor) => {
        if (window.confirm(`Are you sure you want to delete "${vendor.vendor_name}"?`)) {
            fetch("http://localhost/Backend/api/Vendors/deleteVendor.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vendor_id: vendor.vendor_id }),
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === "success") {
                        alert("Vendor deleted successfully!");
                        setVendors(vendors.filter(p => p.vendor_id !== vendor.vendor_id));
                    } else alert("Failed to delete vendor.");
                })
                .catch(err => {
                    console.error(err);
                    alert("Error deleting vendor.");
                });
        }
    };

    // Apply filters
    const filteredVendors = vendors.filter(vendor => {
        // If no filter is selected, show all
        if (!filters.status) return true;
        // Compare status strings exactly (case-sensitive)
        return vendor.status === filters.status;
    });

    return (
        <div className="table-responsive" style={{ maxHeight: "550px", overflowY: "auto" }}>
            <table className="table">
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1 }}>
                    <tr className="table-dark">
                        <th className="align-middle text-center">ID</th>
                        <th className="align-middle text-center">Name</th>
                        <th className="align-middle text-center">Code</th>
                        <th className="align-middle text-center">Contact Person</th>
                        <th className="align-middle text-center">Contact Number</th>
                        <th className="align-middle text-center">Address</th>
                        <th className="align-middle text-center">GST Number</th>
                        <th className="align-middle text-center">Status</th>
                        <th className="align-middle text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredVendors.map(vendor => (
                        <tr key={vendor.vendor_code}>
                            <td className="align-middle text-center">{vendor.vendor_id}</td>
                            <td className="align-middle text-center">{vendor.vendor_name}</td>
                            <td className="align-middle text-center">{vendor.vendor_code}</td>
                            <td className="align-middle text-center">{vendor.contact_person}</td>
                            <td className="align-middle text-center">{vendor.contact_number}</td>
                            <td className="align-middle text-center">{vendor.address}</td>
                            <td className="align-middle text-center">{vendor.gst_number}</td>
                            <td className={`${vendor.status === "Inactive" ? "table-danger" : "table-success"} align-middle text-center`}>
                                {vendor.status}
                            </td>
                            <td className="align-middle text-center">
                                <button className="btn btn-warning me-2" onClick={() => handleEdit(vendor)}>Edit</button>
                                <button className="btn btn-danger" onClick={() => handleDelete(vendor)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && <EditVendorModal vendor={editVendor} onClose={handleCloseModal} />}
        </div>
    );
};

export default ListVendors;
