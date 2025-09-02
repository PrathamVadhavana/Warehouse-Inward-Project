<?php
require_once "../connect.php"; 

header("Content-Type: application/json; charset=UTF-8");

// Allow CORS (remove if not needed)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Get JSON data
$data = json_decode(file_get_contents("php://input"), true);

try {
    if (!$data) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid JSON input"]);
        exit;
    }

    $product_code  = $data['product_code'] ?? null;
    $hsn_code      = $data['hsn_code'] ?? null;
    $product_name  = $data['product_name'] ?? null;
    $category      = $data['category'] ?? null;
    $quantity      = isset($data['quantity']) ? (int)$data['quantity'] : null;
    $status        = $data['status'] ?? "Active";

    // ✅ Validations
    if (!$product_code || !$hsn_code || !$product_name || !$category || $quantity === null || $status === null) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
        exit;
    }

    if (!is_numeric($quantity) || $quantity < 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Quantity must be a non-negative number"]);
        exit;
    }

    // Check if product exists
    $check_sql = "SELECT product_code FROM products WHERE product_code = ?";
    $check_stmt = $conn->prepare($check_sql);
    if (!$check_stmt) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
        exit;
    }

    $check_stmt->bind_param("s", $product_code);
    $check_stmt->execute();
    $check_stmt->store_result();

    if ($check_stmt->num_rows > 0) {
        http_response_code(409); // Conflict
        echo json_encode(["status" => "error", "message" => "Product already exists"]);
    } else {

        $insert_sql = "INSERT INTO products (product_code, hsn_code, product_name, category, quantity, status, is_deleted)
                       VALUES (?, ?, ?, ?, ?, ?, 0)";
        $insert_stmt = $conn->prepare($insert_sql);

        if (!$insert_stmt) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
            exit;
        }

        $insert_stmt->bind_param("ssssis", $product_code, $hsn_code, $product_name, $category, $quantity, $status);

        if ($insert_stmt->execute()) {
            http_response_code(201); // Created
            echo json_encode(["status" => "success", "message" => "Product added successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $insert_stmt->error]);
        }
        $insert_stmt->close();
    }

    $check_stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Unexpected server error: " . $e->getMessage()]);
}
