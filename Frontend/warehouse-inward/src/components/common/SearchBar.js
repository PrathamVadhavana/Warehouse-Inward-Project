import React from "react";

const SearchBar = ({ search, setSearch, searchFields }) => {
  return (
    <form className="d-flex" role="search" onSubmit={(e) => e.preventDefault()}>
      <input
        className="form-control me-2"
        type="search"
        placeholder="Search..."
        value={search.text}
        onChange={(e) => setSearch({ ...search, text: e.target.value })}
      />
      <div className="btn-group">
        <button
          type="button"
          className="btn btn-success dropdown-toggle"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Search by {search.field}
        </button>
        <ul className="dropdown-menu">
          {searchFields.map((field) => (
            <li key={field}>
              <button
                className="dropdown-item"
                type="button"
                onClick={() => setSearch({ ...search, field })}
              >
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
};

export default SearchBar;
