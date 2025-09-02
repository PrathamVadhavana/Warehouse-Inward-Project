import React from "react";

const ReusableTable = ({
  columns,
  data,
  totalRecords = 0,
  page = 1,
  limit = 13,
  onPageChange = () => {},
}) => {
  const totalPages = Math.ceil(totalRecords / limit);

  const handlePrev = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  return (
    <div>
      {/* Table */}
      <table className="table w-full">
        <thead
          style={{
            position: "sticky",
            top: 0,
            backgroundColor: "#fff",
            zIndex: 1,
          }}
        >
          <tr className="table-dark">
            {columns.map((col, index) => (
              <th
                key={index}
                className="align-middle text-center"
                style={col.style || {}}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="align-middle text-center">
                    {col.render
                      ? col.render(row[col.field], row) // custom render
                      : row[col.field]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="p-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="text-6xl mb-3">🔍</div>
                  <h3 className="text-xl font-semibold">No matching records</h3>
                  <p className="text-sm text-gray-400 mt-2">
                    Try changing your search term or clearing filters.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-3">
          
          <div>
            <button
              className="btn btn-sm btn-outline-primary me-2"
              onClick={handlePrev}
              disabled={page === 1}
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-sm btn-outline-primary ms-2"
              onClick={handleNext}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReusableTable;
