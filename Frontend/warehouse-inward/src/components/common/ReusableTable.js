import React, { useState, useRef, useEffect } from "react";

const ReusableTable = ({
  columns,
  data,
  totalRecords = 0,
  page = 1,
  limit = 13,
  onPageChange = () => {},
}) => {
  const totalPages = totalRecords > 0 ? Math.ceil(totalRecords / limit) : 0;

  const [isEditing, setIsEditing] = useState(false);
  const [tempPage, setTempPage] = useState(page.toString());
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isEditing) setTempPage(String(page));
  }, [page, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handlePrev = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  const showTooltip = (message) => {
    if (inputRef.current) {
      inputRef.current.classList.add("is-invalid");
      inputRef.current.setAttribute("data-bs-original-title", message);

      let tooltipInstance = window.bootstrap.Tooltip.getInstance(inputRef.current);
      if (!tooltipInstance) {
        tooltipInstance = new window.bootstrap.Tooltip(inputRef.current, {
          placement: "top",
          trigger: "manual",
        });
      }
      tooltipInstance.show();
    }
  };

  const hideTooltip = () => {
    if (inputRef.current) {
      inputRef.current.classList.remove("is-invalid");
      const tooltipInstance = window.bootstrap.Tooltip.getInstance(inputRef.current);
      if (tooltipInstance) {
        tooltipInstance.hide();
        setTimeout(() => tooltipInstance.dispose(), 200);
      }
    }
  };

  const validateAndGo = (value) => {
    const v = String(value).trim();
    const num = Number(v);

    if (!Number.isInteger(num) || num < 1 || num > Math.max(1, totalPages)) {
      showTooltip(`Enter 1 – ${Math.max(1, totalPages)}`);
      return false;
    }

    hideTooltip();
    onPageChange(num);
    setIsEditing(false);
    return true;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsEditing(false);
      setTempPage(String(page));
      hideTooltip();
    } else if (e.key === "Enter") {
      validateAndGo(tempPage);
    }
  };

  const handlePageSubmit = (e) => {
    e.preventDefault();
    validateAndGo(tempPage);
  };

  const fillerRows = Math.max(0, limit - data.length);

  return (
    <div style={{ minHeight: "65vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flexGrow: 1 }}>
        <table className="table w-full">
          <thead style={{ position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1 }}>
            <tr className="table-dark">
              {columns.map((col, index) => (
                <th key={index} className="align-middle text-center" style={col.style || {}}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              <>
                {data.map((row, rowIndex) => (
                  <tr key={row.product_id ?? row.id ?? rowIndex}>
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="align-middle text-center">
                        {col.render ? col.render(row[col.field], row) : row[col.field]}
                      </td>
                    ))}
                  </tr>
                ))}
                {Array.from({ length: fillerRows }).map((_, i) => (
                  <tr key={`filler-${i}`} style={{ height: "48px" }}>
                    <td colSpan={columns.length} />
                  </tr>
                ))}
              </>
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
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center" style={{ padding: "8px 0" }}>
          <div>
            <button
              className="btn btn-sm btn-outline-primary me-2"
              onClick={handlePrev}
              disabled={page === 1}
            >
              Prev
            </button>

            <span style={{ margin: "0 12px" }}>
              Page{" "}
              {isEditing ? (
                <form onSubmit={handlePageSubmit} style={{ display: "inline-block" }}>
                  <input
                    ref={inputRef}
                    type="number"
                    value={tempPage}
                    onChange={(e) => {
                      setTempPage(e.target.value);
                      hideTooltip();
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                      setIsEditing(false);
                      setTempPage(String(page));
                      hideTooltip();
                    }}
                    className="form-control form-control-sm d-inline-block"
                    style={{
                      width: "72px",
                      display: "inline-block",
                      verticalAlign: "middle",
                    }}
                    aria-label="Page number"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                  />
                </form>
              ) : (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setTempPage(String(page));
                    setIsEditing(true);
                    setTimeout(() => {
                      if (inputRef.current) inputRef.current.select();
                    }, 0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setTempPage(String(page));
                      setIsEditing(true);
                    }
                  }}
                  style={{ cursor: "pointer", fontWeight: "bold" }}
                >
                  {page}
                </span>
              )}{" "}
              of {totalPages}
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
