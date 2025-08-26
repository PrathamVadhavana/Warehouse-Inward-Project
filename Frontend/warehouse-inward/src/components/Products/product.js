import { Link } from 'react-router-dom';
import AddProductModal from './addproductmodal';
import ListProducts from './listproducts';
import Filter from '../common/Filter';
import SearchBar from '../common/SearchBar';
import { useState } from 'react';
import { useDebounce } from '../common/useDebounce';

const Product = () => {
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState({ text: "", field: "name" });

  const productFilters = [
    { name: "category", label: "Category", options: ["Liquid", "Tablet", "Capsule"] },
    { name: "status", label: "Status", options: ["Active", "Inactive"] }
  ];
  const searchFields = ["name", "code", "hsn"];
  // ✅ Only debounce the text, not the field
  const debouncedText = useDebounce(search.text, 500);

  // Pass debounced text + field to ListVendors
  const debouncedSearch = { ...search, text: debouncedText };

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between align-items-center mb-2">

        {/* Left side */}
        <div className="d-flex align-items-center">
          <p className="h4 fw-bold mb-0 me-3">All Products</p>
        </div>

        {/* Right side */}
        <ul className="nav nav-pills align-items-center">
          <li className="nav-item">
            <Link className="nav-link active mx-3" to="#" data-bs-toggle="modal" data-bs-target="#myModal">
              Add Product
            </Link>
          </li>
          <AddProductModal />
          <Filter filters={productFilters} onFilterChange={setFilters} />
          <SearchBar search={search} setSearch={setSearch} searchFields={searchFields} />
        </ul>
      </div>

      <hr className="mt-2 mb-4" />

      <ListProducts filters={filters} search={debouncedSearch} />
    </div>
  );
};

export default Product;
