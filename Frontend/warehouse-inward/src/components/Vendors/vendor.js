import { Link } from 'react-router-dom';
import AddVendorModal from './addvendormodal';
import ListVendors from './listvendors';
import Filter from './filter';
import { useState } from 'react';

const Vendor = () => {
    const [filters, setFilters] = useState({status: '' });

    return (
        <div className="container mt-3">
            <div className="d-flex justify-content-between align-items-center mb-2">

                {/* Left side */}
                <div className="d-flex align-items-center">
                    <p className="h4 fw-bold mb-0 me-3">All Vendors</p>
                </div>

                {/* Right side */}
                <ul className="nav nav-pills">
                    <li className="nav-item">
                        <Link className="nav-link active mx-3" to="#" data-bs-toggle="modal" data-bs-target="#myModal">Add Vendor</Link>
                    </li>
                    <AddVendorModal />
                    <Filter onFilterChange={setFilters} />
                </ul>
            </div>

            {/* Divider line */}
            <hr className="mt-2 mb-4" />

            <ListVendors filters={filters} />
        </div>
    );
}

export default Vendor;
