import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ReusableTable from "../common/ReusableTable";
import Loading from "../common/loading";
import Filter from "../common/Filter";
import SearchBar from "../common/SearchBar";
import { useDebounce } from "../common/useDebounce";
import VendorModal from "./vendormodal";
import { toast } from "react-toastify";

const API_BASE = process.env.REACT_APP_API_BASE+"/Vendors";

// Map UI search fields → API column names
const fieldMap = {
  name: "vendor_name",
  code: "vendor_code",
  contact_person: "contact_person",
  contact_number: "contact_number",
  gst_number: "gst_number",
  status: "status",
};

const Vendor = () => {
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState({ text: "", field: "name" });
  const [showModal, setShowModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null); // for edit
  const [refreshFlag, setRefreshFlag] = useState(false); // trigger list refresh

  const vendorFilters = [
    { name: "status", label: "Status", options: ["Active", "Inactive"] },
  ];

  const searchFields = ["name", "code", "contact_person"];
  const debouncedText = useDebounce(search.text, 500);
  const debouncedSearch = { ...search, text: debouncedText };

  const handleAdd = () => {
    setSelectedVendor(null); // ensure add mode
    setShowModal(true);
  };

  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setShowModal(true);
  };

  const refreshVendors = () => {
    setRefreshFlag((prev) => !prev); // toggle to trigger ListVendors refresh
  };

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        {/* Left side */}
        <div className="d-flex align-items-center">
          <p className="h4 fw-bold mb-0 me-3">All Vendors</p>
        </div>

        {/* Right side */}
        <div className="d-flex align-items-center">
          <Link className="btn btn-primary me-3" to="#" onClick={handleAdd}>
            Add + 
          </Link>

          <Filter filters={vendorFilters} onFilterChange={setFilters} />
          <SearchBar
            search={search}
            setSearch={setSearch}
            searchFields={searchFields}
          />
        </div>
      </div>

      <hr className="mt-2 mb-4" />

      {/* List of vendors */}
      <ListVendors
        filters={filters}
        search={debouncedSearch}
        refreshFlag={refreshFlag}
        onEdit={handleEdit}
      />

      {/* Add/Edit Modal */}
      {showModal && (
        <VendorModal
          vendor={selectedVendor}
          onClose={() => setShowModal(false)}
          onSuccess={refreshVendors}
        />
      )}
    </div>
  );
};

// ✅ ListVendors merged into same file
const ListVendors = ({
  filters,
  search,
  refreshFlag,
  onEdit,
}) => {
  const [vendors, setVendors] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const status = filters?.status ?? "";
  const searchText = (search?.text ?? "").trim();
  const uiField = (search?.field ?? "").trim();
  const apiField = fieldMap[uiField] || "vendor_name";
  const hasSearch = searchText.length > 0;
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let timer;
    if (loading) {
      // only show loader if still loading after 400ms
      timer = setTimeout(() => setShowLoader(true), 100);
    } else {
      setShowLoader(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  // Reset page on filter/search change
  useEffect(() => {
    setPage(1);
  }, [status, searchText, apiField, refreshFlag]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchVendors = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await axios.post(
          `${API_BASE}/searchVendors.php`,
          {
            search: searchText,
            search_field: apiField,
            status,
            page,
            limit,
          },
          { signal }
        );

        if (signal.aborted) return;

        if (res?.data?.status === "success") {
          const rows = Array.isArray(res.data.data) ? res.data.data : [];
          setVendors(rows);

          const totalRecords =
            res.data.total ?? res.data.pagination?.totalRecords ?? 0;
          setTotal(Number(totalRecords) || 0);

          if (rows.length === 0)
            setError(res.data?.message || "No vendors found.");
        } else {
          const msg = res?.data?.message || "Request failed.";
          setVendors([]);
          setTotal(0);
          setError(msg);
          toast.info(msg);
        }
      } catch (err) {
        if (axios.isCancel(err)) return;

        const backendMsg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load vendors.";
        setVendors([]);
        setTotal(0);
        setError(backendMsg);
        toast.error(backendMsg);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    fetchVendors();
    return () => controller.abort();
  }, [
    page,
    limit,
    status,
    searchText,
    apiField,
    hasSearch,
    refreshFlag,
  ]);

  const handleDelete = async (vendor) => {
    if (!vendor?.vendor_code) return;
    if (!window.confirm(`Delete "${vendor.vendor_name}"?`)) return;

    try {
      const res = await axios.post(`${API_BASE}/deleteVendor.php`, {
        vendor_code: vendor.vendor_code,
      });

      if (res?.data?.status === "success") {
        setVendors((prev) =>
          prev.filter((p) => p.vendor_code !== vendor.vendor_code)
        );
        setTotal((prev) => Math.max(prev - 1, 0));

        toast.success(`"${vendor.vendor_name}" deleted successfully.`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(res?.data?.message || "Delete failed.");
      }
    } catch (err) {
      const backendMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete vendor.";
      toast.error(backendMsg);
    }
  };

  const columns = useMemo(
    () => [
      { header: "Code", field: "vendor_code" },
      { header: "Name", field: "vendor_name" },
      { header: "Contact Person", field: "contact_person" },
      { header: "Contact Number", field: "contact_number" },
      { header: "GST Number", field: "gst_number" },
      { header: "Address", field: "address" },
      {
        header: "Status",
        field: "status",
        render: (value) => (
          <span
            style={{
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "0.9rem",
              fontWeight: "500",
              backgroundColor: value === "Inactive" ? "#f8d7da" : "#d4edda",
              color: value === "Inactive" ? "#721c24" : "#155724",
              border: `1px solid ${
                value === "Inactive" ? "#f5c6cb" : "#c3e6cb"
              }`,
            }}
          >
            {value}
          </span>
        ),
      },
      {
        header: "Created At",
        field: "created_at",
        render: (value) => (value ? new Date(value).toLocaleDateString() : "-"),
      },
      {
        header: "Updated At",
        field: "updated_at",
        render: (value) => (value ? new Date(value).toLocaleDateString() : "-"),
      },
      {
        header: "Actions",
        render: (_, row) => (
          <>
            <button
              className="btn btn-sm btn-link text-primary me-2"
              onClick={() => onEdit(row)}
            >
              <i
                className="fa-regular fa-pen-to-square"
                style={{ color: "#23dd3c" }}
              ></i>
            </button>
            <button
              className="btn btn-sm btn-link text-danger"
              onClick={() => handleDelete(row)}
            >
              <i className="fa-solid fa-trash"></i>
            </button>
          </>
        ),
      },
    ],
    [onEdit]
  );

  return (
    <div>
      <div className="mb-2">
        <strong>Total Records: {total}</strong>
      </div>

      {showLoader ? (
        <Loading />
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <div className="table-responsive">
          <ReusableTable
            columns={columns}
            data={vendors}
            totalRecords={total}
            page={page}
            limit={limit}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default Vendor;
