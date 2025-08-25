<?php
require_once("../connect.php");
// Get JSON data from frontend
$data = json_decode(file_get_contents("php://input"), true);
$product_code  = $data['product_code'] ?? null;
$hsn_code      = $data['hsn_code'] ?? null;
$product_name  = $data['product_name'] ?? null;
$category      = $data['category'] ?? null;
$quantity      = isset($data['quantity']) ? (int)$data['quantity'] : 0;
// Validate required fields
if (!$product_code || !$hsn_code || !$product_name || !$category) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}
if($quantity > 0){
    $status = "Available"; // In Stock
} else {
    $status = "Not Available"; // Out of Stock
}
// Update product details
$update_sql = "UPDATE products SET hsn_code = ?, product_name = ?, category = ?, quantity = ?, status = ? WHERE product_code = ?";
$update_stmt = $conn->prepare($update_sql);
$update_stmt->bind_param("sssiss", $hsn_code, $product_name, $category, $quantity, $status, $product_code);
if ($update_stmt->execute()) {
    if ($update_stmt->affected_rows > 0) {
        echo json_encode(["status" => "success", "message" => "Product updated successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "No changes made or product not found"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => $update_stmt->error]);
}
$update_stmt->close();
$conn->close();

?>