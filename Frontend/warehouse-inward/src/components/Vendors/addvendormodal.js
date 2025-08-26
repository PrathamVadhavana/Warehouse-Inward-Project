import { useState } from "react";
import axios from "axios";

const AddVendorModal = () => {
    const [formData, setFormData] = useState({ vendor_code: '', gst_number: '', vendor_name: '', contact_person: '', contact_number: '', address: '', status: '' });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        console.log(formData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...formData, contact_number: parseInt(formData.contact_number) || 0 };
        try {
            const res = await axios.post(
                "http://localhost/Backend/api/Vendors/addVendor.php",
                payload
            );
            if (res.data.message === "Vendor already exists") {
                alert("Vendor already exists!");
                return;
            }
            alert("Vendor added successfully!");
            console.log(res.data);
            window.location.reload();
        } catch (error) {
            console.error(error);
        }

    }

    return (
        <div
            className="modal fade"
            id="vendorModal"
            tabIndex="-1"
            aria-labelledby="VendorModalLabel"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="VendorModalLabel">
                            Vendor Details
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
                            {/* Vendor Code */}
                            <div className="mb-3">
                                <label htmlFor="Vendor-code" className="col-form-label">
                                    Vendor Code:
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="vendor_code"
                                    placeholder="e.g., P001"
                                    value={formData.vendor_code ?? ''}
                                    onChange={handleInputChange}
                                />
                            </div>


                            {/* Vendor Name */}
                            <div className="mb-3">
                                <label htmlFor="vendor-name" className="col-form-label">
                                    Vendor Name:
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="vendor_name"
                                    placeholder="e.g., ABC Pharma"
                                    value={formData.vendor_name ?? ''}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Contact Person */}
                            <div className="mb-3">
                                <label htmlFor="contact_person" className="col-form-label">
                                    Contact Person:
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="contact_person"
                                    placeholder="e.g., Mark Kelvin"
                                    value={formData.contact_person ?? ''}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Contact Number */}
                            <div className="mb-3">
                                <label htmlFor="contact_number" className="col-form-label">
                                    Contact Number:
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="contact_number"
                                    placeholder="e.g., 9876543210"
                                    onChange={handleInputChange}
                                    value={formData.contact_number ?? 0}
                                />
                            </div>

                            {/* GST Number */}
                            <div className="mb-3">
                                <label htmlFor="gst-number" className="col-form-label">
                                    GST Number:
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="gst_number"
                                    placeholder="e.g., 30049011"
                                    value={formData.gst_number ?? ''}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Address */}
                            <div className="mb-3">
                                <label htmlFor="address" className="form-label">
                                    Address:
                                </label>
                                <textarea
                                    className="form-control"
                                    id="address"
                                    placeholder="e.g., 123 Main Street, City, Country"
                                    onChange={handleInputChange}
                                    value={formData.address ?? ""}
                                    rows={3} // adjust height
                                />
                            </div>


                            {/* Status Dropdown */}
                            <div className="mb-3">
                                <label htmlFor="status" className="col-form-label">
                                    Status:
                                </label>
                                <select className="form-select" id="status" onChange={handleInputChange}>
                                    <option value="">-- Select Status --</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    data-bs-dismiss="modal"
                                >
                                    Close
                                </button>
                                <button name="submit" className="btn btn-primary">
                                    Add
                                </button>
                            </div>
                        </form>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default AddVendorModal;