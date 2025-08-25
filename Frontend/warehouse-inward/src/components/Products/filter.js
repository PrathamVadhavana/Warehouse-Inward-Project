import React, { useState } from 'react';

const Filter = ({ onFilterChange }) => {
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  const handleApply = () => {
    onFilterChange({ category, status });
  };

  const handleReset = () => {
    setCategory('');
    setStatus('');
    onFilterChange({ category: '', status: '' });
  };

  return (
    <div className="btn-group me-3">
      <button type="button" className="btn btn-warning dropdown-toggle" data-bs-toggle="dropdown">
        Filter
      </button>
      <ul className="dropdown-menu p-3" style={{ minWidth: "200px" }}>
        <li className="mb-2">
          <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Category</option>
            <option value="Liquid">Liquid</option>
            <option value="Tablet">Tablet</option>
            <option value="Capsule">Capsule</option>
          </select>
        </li>
        <li className="mb-2">
          <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">Status</option>
            <option value="Available">Available</option>
            <option value="Not Available">Not Available</option>
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
