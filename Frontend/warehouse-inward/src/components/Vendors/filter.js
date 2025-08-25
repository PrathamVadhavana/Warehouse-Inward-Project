import React, { useState } from 'react';

const Filter = ({ onFilterChange }) => {
  const [status, setStatus] = useState('');

  const handleApply = () => {
    onFilterChange({status});
  };

  const handleReset = () => {
    setStatus('');
    onFilterChange({status: '' });
  };

  return (
    <div className="btn-group me-3">
      <button type="button" className="btn btn-warning dropdown-toggle" data-bs-toggle="dropdown">
        Filter
      </button>
      <ul className="dropdown-menu p-3" style={{ minWidth: "200px" }}>
        <li className="mb-2">
          <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </li>
        <li className="d-flex justify-content-between mt-2">
          <button className="btn btn-primary btn-sm" onClick={handleApply}>Apply</button>
          <button className="btn btn-secondary btn-sm" onClick={handleReset}>Reset</button>
        </li>
      </ul>
    </div>
  );
};

export default Filter;
