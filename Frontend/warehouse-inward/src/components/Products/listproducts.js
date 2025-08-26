import { useState, useEffect } from "react";
import EditProductModal from "./editproductmodal";
import { Link } from "react-router-dom";

const ListProducts = ({ filters, search }) => {
    const [products, setProducts] = useState([]);
    const [editProduct, setEditProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch("http://localhost/Backend/api/Products/getproducts.php");
                const data = await res.json();
                setProducts(data);
            } catch (err) {
                console.error("Failed to fetch products:", err);
                setProducts([]);
            }
        };
        fetchProducts();
    }, []);

    const handleEdit = (product) => {
        setEditProduct(product);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditProduct(null);
    };

    const handleDelete = (product) => {
        if (window.confirm(`Are you sure you want to delete "${product.product_name}"?`)) {
            fetch("http://localhost/Backend/api/Products/deleteProduct.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: product.product_id }),
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === "success") {
                        alert("Product deleted successfully!");
                        setProducts(products.filter(p => p.product_code !== product.product_code));
                    } else alert("Failed to delete product.");
                })
                .catch(err => {
                    console.error(err);
                    alert("Error deleting product.");
                });
        }
    };

    // Apply filters
    const filteredProducts = products.filter((p) => {
        const categoryMatch = filters.category ? p.category === filters.category : true;
        const statusMatch = filters.status ? p.status === filters.status : true;

        // search match
        let searchMatch = true;
        if (search?.text) {
            const text = search.text.toLowerCase();
            if (search.field === "name") searchMatch = p.product_name.toLowerCase().includes(text);
            if (search.field === "code") searchMatch = p.product_code.toLowerCase().includes(text);
            if (search.field === "hsn") searchMatch = p.hsn_code.toLowerCase().includes(text);
        }

        return categoryMatch && statusMatch && searchMatch;
    });

    return (
        <div className="table-responsive" style={{ maxHeight: "550px", overflowY: "auto" }}>
            <table className="table">
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1 }}>
                    <tr className="table-dark">
                        <th className="align-middle text-center">ID</th>
                        <th className="align-middle text-center">Name</th>
                        <th className="align-middle text-center">Code</th>
                        <th className="align-middle text-center">HSN</th>
                        <th className="align-middle text-center">Category</th>
                        <th className="align-middle text-center">Quantity</th>
                        <th className="align-middle text-center">Status</th>
                        <th className="align-middle text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.map(product => (
                        <tr key={product.product_code}>
                            <td className="align-middle text-center">{product.product_id}</td>
                            <td className="align-middle text-center">{product.product_name}</td>
                            <td className="align-middle text-center">{product.product_code}</td>
                            <td className="align-middle text-center">{product.hsn_code}</td>
                            <td className="align-middle text-center">{product.category}</td>
                            <td className="align-middle text-center">{product.quantity}</td>
                            <td className={`${product.status === "Inactive" ? "table-danger" : "table-success"} align-middle text-center`}>
                                {product.status}
                            </td>
                            <td className="align-middle text-center">
                                <Link onClick={() => handleEdit(product)} className="me-3"><i className="fa-regular fa-pen-to-square" style={{ color: "#23dd3cff" }}></i></Link>
                                <Link onClick={() => handleDelete(product)}><i class="fa-solid fa-trash" style={{ color: "#e50606" }}></i></Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && <EditProductModal product={editProduct} onClose={handleCloseModal} />}
        </div>
    );
};

export default ListProducts;
