import { Link } from 'react-router-dom';
import AddPIModal from './addPIModal';
import ListPIs from './listPIs';
import Filter from '../common/Filter';
import SearchBar from '../common/SearchBar';
import { useState } from 'react';
import { useDebounce } from '../common/useDebounce';

const PI = () => {
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState({ text: "", field: "pi_id" });

  // Example PI filters
  const piFilters = [
    { name: "status", label: "Status", options: ["Pending", "Approved", "Rejected", "Cancelled"] },
  ];

  const searchFields = ["pi_id", "grn_id", "invoice_no"]; // fields you want to search

  // ✅ Only debounce the text, not the field
  const debouncedText = useDebounce(search.text, 500);

  // Pass debounced text + field to ListPIs
  const debouncedSearch = { ...search, text: debouncedText };

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        {/* Left side */}
        <div className="d-flex align-items-center">
          <p className="h4 fw-bold mb-0 me-3">All PIs</p>
        </div>

        {/* Right side */}
        <ul className="nav nav-pills align-items-center">
          <li className="nav-item">
            <Link className="nav-link active mx-3" to="#" data-bs-toggle="modal" data-bs-target="#addPIModal">
              Add PI
            </Link>
          </li>
          <AddPIModal />
          <Filter filters={piFilters} onFilterChange={setFilters} />
          <SearchBar search={search} setSearch={setSearch} searchFields={searchFields} />
        </ul>
      </div>

      <hr className="mt-2 mb-4" />
      <ListPIs filters={filters} search={debouncedSearch} />
    </div>
  );
};

export default PI;
