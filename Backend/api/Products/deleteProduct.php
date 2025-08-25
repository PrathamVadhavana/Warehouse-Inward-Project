<?php
# delete Product
require_once "../connect.php"; 

// Get JSON data from frontend
$data = json_decode(file_get_contents("php://input"), true);
$product_id  = $data['product_id'] ?? null;
// Validate required fields
if (!$product_id) {
    echo json_encode(["status" => "error", "message" => "Missing product_id"]);
    exit;
}

// Check if product exists
$check_sql = "SELECT product_id FROM products WHERE product_id = ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("s", $product_id);
$check_stmt->execute();
$check_stmt->store_result();

if ($check_stmt->num_rows == 0) {
    // Product does not exist, send error
    echo json_encode(["status" => "error", "message" => "Product not found"]);
} else {
    // Product exists, delete it
    $delete_sql = "DELETE FROM products WHERE product_id = ?";
    $delete_stmt = $conn->prepare($delete_sql);
    $delete_stmt->bind_param("s", $product_id);
    if ($delete_stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Product deleted successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => $delete_stmt->error]);
    }
    $delete_stmt->close();
}