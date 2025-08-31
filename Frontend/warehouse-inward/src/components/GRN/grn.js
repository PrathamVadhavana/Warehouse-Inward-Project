import { Link } from 'react-router-dom';
import AddGRNModal from './addGRNModal';
import ListGRNs from './listGRNs';
import Filter from '../common/Filter';
import SearchBar from '../common/SearchBar';
import { useState } from 'react';
import { useDebounce } from '../common/useDebounce';

const GRN = () => {
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState({ text: "", field: "grn_id" });

  // Example GRN filters
  const grnFilters = [
    { name: "status", label: "Status", options: ["Pending", "Completed", "Cancelled"] },
  ];

  const searchFields = ["grn_id", "po_id"]; // fields you want to search

  // ✅ Only debounce the text, not the field
  const debouncedText = useDebounce(search.text, 500);

  // Pass debounced text + field to ListGRNs
  const debouncedSearch = { ...search, text: debouncedText };

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        {/* Left side */}
        <div className="d-flex align-items-center">
          <p className="h4 fw-bold mb-0 me-3">All GRNs</p>
        </div>

        {/* Right side */}
        <ul className="nav nav-pills align-items-center">
          <li className="nav-item">
            <Link className="nav-link active mx-3" to="#" data-bs-toggle="modal" data-bs-target="#addGRNModal">
              Add GRN
            </Link>
          </li>
          <AddGRNModal />
          <Filter filters={grnFilters} onFilterChange={setFilters} />
          <SearchBar search={search} setSearch={setSearch} searchFields={searchFields} />
        </ul>
      </div>

      <hr className="mt-2 mb-4" />

      <ListGRNs filters={filters} search={debouncedSearch} />
    </div>
  );
};

export default GRN;
