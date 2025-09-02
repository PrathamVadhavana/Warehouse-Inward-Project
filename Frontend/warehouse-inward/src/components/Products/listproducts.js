import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import ReusableTable from "../common/ReusableTable";
import Loading from "../common/loading";
import { toast } from "react-toastify";

const API_BASE = "http://localhost/Backend/api/Products";

const fieldMap = {
  name: "product_name",
  code: "product_code",
  hsn: "hsn_code",
  category: "category",
  status: "status",
};

const ListProducts = ({ filters, search, refreshFlag, onEdit }) => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(14);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const category = filters?.category ?? "";
  const status = filters?.status ?? "";
  const searchText = (search?.text ?? "").trim();
  const uiField = (search?.field ?? "").trim();
  const apiField = fieldMap[uiField] || "product_name";
  const hasSearch = searchText.length > 0;

  // Reset page on filter/search change
  useEffect(() => {
    setPage(1);
  }, [category, status, searchText, apiField, refreshFlag]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        let res;

        // Backend handles both search + filter together
        res = await axios.post(`${API_BASE}/searchProducts.php`, {
          search: searchText,
          search_field: apiField,
          category,
          status,
          page,
          limit,
        }, { signal });

        if (signal.aborted) return;

        if (res?.data?.status === "success") {
          const rows = Array.isArray(res.data.data) ? res.data.data : [];
          setProducts(rows);

          const totalRecords = res.data.total ?? res.data.pagination?.totalRecords ?? 0;
          setTotal(Number(totalRecords) || 0);

          if (rows.length === 0) {
            setError(res.data?.message || "No products found.");
          }
        } else {
          const msg = res?.data?.message || "Request failed.";
          setProducts([]);
          setTotal(0);
          setError(msg);
          toast.info(msg);
        }
      } catch (err) {
        if (axios.isCancel(err)) return;

        const backendMsg = err?.response?.data?.message || err?.message || "Failed to load products.";
        setProducts([]);
        setTotal(0);
        setError(backendMsg);
        toast.error(backendMsg);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [page, limit, category, status, searchText, apiField, hasSearch, refreshFlag]);

  const columns = useMemo(() => [
    { header: "ID", field: "product_id"},
    { header: "Name", field: "product_name" },
    { header: "Code", field: "product_code" },
    { header: "HSN", field: "hsn_code" },
    { header: "Category", field: "category" },
    { header: "Quantity", field: "quantity" },
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
            border: `1px solid ${value === "Inactive" ? "#f5c6cb" : "#c3e6cb"}`,
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
              <i className="fa-regular fa-pen-to-square" style={{ color: '#23dd3c' }}></i>
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
  ], [onEdit]);

  const handleDelete = async (product) => {
    if (!product?.product_id) return;
    if (!window.confirm(`Delete "${product.product_name}"?`)) return;

    try {
      const res = await axios.post(`${API_BASE}/deleteProduct.php`, {
        product_id: product.product_id,
      });

      if (res?.data?.status === "success") {
        setProducts((prev) => prev.filter((p) => p.product_id !== product.product_id));
        setTotal((prev) => Math.max(prev - 1, 0));
        // window.location.reload();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        toast.success(`"${product.product_name}" deleted successfully.`);
      } else {
        toast.error(res?.data?.message || "Delete failed.");
      }
    } catch (err) {
      const backendMsg = err?.response?.data?.message || err?.message || "Failed to delete product.";
      toast.error(backendMsg);
    }
  };

  return (
    <div>
      <div className="mb-2">
        <strong>Total Records: {total}</strong>
      </div>

      {loading && <Loading />}
      {error && !loading && <p className="text-danger">{error}</p>}

      <div className="table-responsive">
        <ReusableTable
          columns={columns}
          data={products}
          totalRecords={total}
          page={page}
          limit={limit}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default ListProducts;
