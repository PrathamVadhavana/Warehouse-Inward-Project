import { useState, useEffect } from "react";
import EditProductModal from "./editproductmodal";
import { Link } from "react-router-dom";
import axios from "axios";
import ReusableTable from "../common/ReusableTable"; 

const ListProducts = ({ filters, search }) => {
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!search?.text) {
          const res = await fetch("http://localhost/Backend/api/Products/getproducts.php");
          const data = await res.json();
          setProducts(data);
        } else {
          const res = await axios.post(
            "http://localhost/Backend/api/Products/searchProducts.php",
            { search: search.text }
          );
          const data = res.data;

          if (data.status === "success") {
            setProducts(data.data);
          } else {
            setProducts([]);
          }
        }
      } catch (err) {
        console.error("Fetch/Search error:", err);
        setProducts([]);
      }
    };

    fetchProducts();
  }, [search]);

  const handleEdit = (product) => {
    setEditProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditProduct(null);
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.product_name}"?`)) {
      try {
        const res = await axios.post(
          "http://localhost/Backend/api/Products/deleteProduct.php",
          { product_id: product.product_id }
        );
        const data = res.data;

        if (data.status === "success") {
          setProducts(products.filter((p) => p.product_code !== product.product_code));
        } else {
          console.error("Delete failed:", data.message);
        }
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  // ✅ filtering logic
  const filteredProducts = products.filter((p) => {
    const categoryMatch = filters.category ? p.category === filters.category : true;
    const statusMatch = filters.status ? p.status === filters.status : true;
    return categoryMatch && statusMatch;
  });

  // ✅ define columns for ReusableTable
  const columns = [
    { header: "ID", field: "product_id" },
    { header: "Name", field: "product_name" },
    { header: "Code", field: "product_code" },
    { header: "HSN", field: "hsn_code" },
    { header: "Category", field: "category" },
    { header: "Quantity", field: "quantity" },
    {
      header: "Status",
      field: "status",
      render: (value) => (
        <span className={value === "Inactive" ? "badge bg-danger" : "badge bg-success"}>
          {value}
        </span>
      ),
    },
    {
      header: "Created At",
      field: "created_at",
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      header: "Updated At",
      field: "updated_at",
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      header: "Actions",
      render: (_, row) => (
        <>
          <Link onClick={() => handleEdit(row)} className="me-3">
            <i className="fa-regular fa-pen-to-square" style={{ color: "#23dd3cff" }}></i>
          </Link>
          <Link onClick={() => handleDelete(row)}>
            <i className="fa-solid fa-trash" style={{ color: "#e50606" }}></i>
          </Link>
        </>
      ),
    },
  ];

  return (
    <div className="table-responsive" style={{ maxHeight: "550px", overflowY: "auto" }}>
      <ReusableTable columns={columns} data={filteredProducts} />
      {showModal && <EditProductModal product={editProduct} onClose={handleCloseModal} />}
    </div>
  );
};

export default ListProducts;
