import { useState } from "react";
import { Link } from "react-router-dom";
import ListProducts from "./listproducts";
import Filter from "../common/Filter";
import SearchBar from "../common/SearchBar";
import { useDebounce } from "../common/useDebounce";
import ProductModal from "./productmodal";

const Product = () => {
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState({ text: "", field: "name" });
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // for edit
  const [refreshFlag, setRefreshFlag] = useState(false); // trigger list refresh

  const productFilters = [
    { name: "category", label: "Category", options: ["Liquid", "Tablet", "Capsule"] },
    { name: "status", label: "Status", options: ["Active", "Inactive"] },
  ];

  const searchFields = ["name", "code", "hsn"];
  const debouncedText = useDebounce(search.text, 500);
  const debouncedSearch = { ...search, text: debouncedText };

  const handleAdd = () => {
    setSelectedProduct(null); // ensure add mode
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const refreshProducts = () => {
    setRefreshFlag((prev) => !prev); // toggle to trigger ListProducts refresh
  };

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        {/* Left side */}
        <div className="d-flex align-items-center">
          <p className="h4 fw-bold mb-0 me-3">All Products</p>
        </div>

        {/* Right side */}
        <div className="d-flex align-items-center">
          <Link
            className="btn btn-primary me-3"
            to="#"
            onClick={handleAdd}
          >
            Add Product
          </Link>

          <Filter filters={productFilters} onFilterChange={setFilters} />
          <SearchBar search={search} setSearch={setSearch} searchFields={searchFields} />
        </div>
      </div>

      <hr className="mt-2 mb-4" />

      <ListProducts
        filters={filters}
        search={debouncedSearch}
        refreshFlag={refreshFlag} // pass to trigger refresh
        onEdit={handleEdit} // allow ListProducts to open modal for edit
      />

      {showModal && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setShowModal(false)}
          onSuccess={refreshProducts}
        />
      )}
    </div>
  );
};

export default Product;
