import { Link } from 'react-router-dom';
import AddProductModal from './addproductmodal';
import ListProducts from './listproducts';
import Filter from './filter';
import { useState } from 'react';

const Product = () => {
    const [filters, setFilters] = useState({ category: '', status: '' });

    return (
        <div className="container mt-3">
            <div className="d-flex justify-content-between align-items-center mb-2">

                {/* Left side */}
                <div className="d-flex align-items-center">
                    <p className="h4 fw-bold mb-0 me-3">All Products</p>
                </div>

                {/* Right side */}
                <ul className="nav nav-pills">
                    <li className="nav-item">
                        <Link className="nav-link active mx-3" to="#" data-bs-toggle="modal" data-bs-target="#myModal">Add Product</Link>
                    </li>
                    <AddProductModal />
                    <Filter onFilterChange={setFilters} />
                </ul>
            </div>

            {/* Divider line */}
            <hr className="mt-2 mb-4" />

            <ListProducts filters={filters} />
        </div>
    );
}

export default Product;
