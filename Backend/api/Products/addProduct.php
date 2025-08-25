<?php
require_once "../connect.php"; // adjust path if needed

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

// Check if product already exists
$check_sql = "SELECT product_code FROM products WHERE product_code = ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("s", $product_code);
$check_stmt->execute();
$check_stmt->store_result();

if ($check_stmt->num_rows > 0) {
    // Product exists, send error
    echo json_encode(["status" => "error", "message" => "Product already exists"]);
} else {
    if($quantity > 0){
        $status = "Available"; // In Stock
    } else {
        $status = "Not Available"; // Out of Stock
    }

    // Product does not exist, insert new
    $insert_sql = "INSERT INTO products (product_code, hsn_code, product_name, category, quantity, status)
                   VALUES (?, ?, ?, ?, ?, ?)";
    $insert_stmt = $conn->prepare($insert_sql);
    $insert_stmt->bind_param("ssssis", $product_code, $hsn_code, $product_name, $category, $quantity, $status);

    if ($insert_stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Product added successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => $insert_stmt->error]);
    }
    $insert_stmt->close();
}

$check_stmt->close();
$conn->close();
?>
