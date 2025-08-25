import { useState, useEffect } from "react";
import EditProductModal from "./editproductmodal";

const ListProducts = ({ filters }) => {
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
                body: JSON.stringify({ product_code: product.product_code }),
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
    const filteredProducts = products.filter(p => {
        const categoryMatch = filters.category ? p.category === filters.category : true;
        const statusMatch = filters.status ? p.status === filters.status : true;
        return categoryMatch && statusMatch;
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
                            <td className={`${product.status === "Not Available" ? "table-danger" : "table-success"} align-middle text-center`}>
                                {product.status}
                            </td>
                            <td className="align-middle text-center">
                                <button className="btn btn-warning me-2" onClick={() => handleEdit(product)}>Edit</button>
                                <button className="btn btn-danger" onClick={() => handleDelete(product)}>Delete</button>
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
