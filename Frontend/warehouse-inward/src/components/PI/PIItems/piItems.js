import ListPIItems from './listPIItems';
import SearchBar from '../../common/SearchBar';
import { useState } from 'react';
import { useDebounce } from '../../common/useDebounce';

const PIItems = () => {
  const [search, setSearch] = useState({ text: "", field: "PI Id" });

  // 🔍 Define searchable fields for PI Items
  const searchFields = ["PI Id", "PI Item Id", "Product Id", "Invoice No"];

  // ✅ Debounce only the search text
  const debouncedText = useDebounce(search.text, 500);

  // Final search object with debounced text
  const debouncedSearch = { ...search, text: debouncedText };

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between align-items-center mb-2">

        {/* Left side */}
        <div className="d-flex align-items-center">
          <p className="h4 fw-bold mb-0 me-3">All PI Items</p>
        </div>

        {/* Right side */}
        <ul className="nav nav-pills align-items-center">
          <SearchBar
            search={search}
            setSearch={setSearch}
            searchFields={searchFields}
          />
        </ul>
      </div>

      <hr className="mt-2 mb-4" />

      {/* List of PI Items */}
      <ListPIItems search={debouncedSearch} />
    </div>
  );
};

export default PIItems;
