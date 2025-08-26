import React, { useState } from "react";

const Filter = ({ filters = [], onFilterChange }) => {
  const [values, setValues] = useState(
    filters.reduce((acc, f) => ({ ...acc, [f.name]: "" }), {})
  );

  const handleChange = (name, value) => {
    setValues({ ...values, [name]: value });
  };

  const handleApply = () => {
    onFilterChange(values);
  };

  const handleReset = () => {
    const resetValues = filters.reduce((acc, f) => ({ ...acc, [f.name]: "" }), {});
    setValues(resetValues);
    onFilterChange(resetValues);
  };

  return (
    <div className="btn-group me-3">
      <button
        type="button"
        className="btn btn-warning dropdown-toggle"
        data-bs-toggle="dropdown"
      >
        Filter
      </button>
      <ul className="dropdown-menu p-3" style={{ minWidth: "200px" }}>
        {filters.map((filter) => (
          <li className="mb-2" key={filter.name}>
            <select
              className="form-select"
              value={values[filter.name]}
              onChange={(e) => handleChange(filter.name, e.target.value)}
            >
              <option value="">{filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </li>
        ))}
        <li className="d-flex justify-content-between mt-2">
          <button className="btn btn-primary btn-sm" onClick={handleApply}>
            Apply
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleReset}>
            Reset
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Filter;
