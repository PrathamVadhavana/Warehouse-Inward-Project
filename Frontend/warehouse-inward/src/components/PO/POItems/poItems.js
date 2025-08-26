import ListPOItems from './listPOItems';
import SearchBar from '../../common/SearchBar';
import { useState } from 'react';
import { useDebounce } from '../../common/useDebounce';

const POItems = () => {
  const [search, setSearch] = useState({ text: "", field: "PO Id" });

  const searchFields = ["PO Id", "Medicine Id"];
  // ✅ Only debounce the text, not the field
  const debouncedText = useDebounce(search.text, 500);

  // Pass debounced text + field to ListVendors
  const debouncedSearch = { ...search, text: debouncedText };

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between align-items-center mb-2">

        {/* Left side */}
        <div className="d-flex align-items-center">
          <p className="h4 fw-bold mb-0 me-3">All Purchase Order Items</p>
        </div>

        {/* Right side */}
        <ul className="nav nav-pills align-items-center">
          <SearchBar search={search} setSearch={setSearch} searchFields={searchFields} />
        </ul>
      </div>

      <hr className="mt-2 mb-4" />

      <ListPOItems search={debouncedSearch} />
    </div>
  );
};

export default POItems;
