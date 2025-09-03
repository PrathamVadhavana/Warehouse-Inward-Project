<?php
require_once "../connect.php";

header("Content-Type: application/json; charset=UTF-8");

// Allow CORS (remove if not needed)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

try {
    if (!$data || !is_array($data)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid JSON input"]);
        exit;
    }

    // Sanitize + enforce types
    $hsn_code     = isset($data['hsn_code']) ? trim($data['hsn_code']) : null;
    $product_name = isset($data['product_name']) ? trim($data['product_name']) : null;
    $category     = isset($data['category']) ? trim($data['category']) : null;
    $quantity     = isset($data['quantity']) ? (int)$data['quantity'] : null;
    $status       = isset($data['status']) ? trim($data['status']) : "Active";

    // Check if product with same HSN or name already exists
    $checkSql = "SELECT product_code FROM products WHERE (hsn_code = ? OR product_name = ?) AND deleted_at IS NULL";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("ss", $hsn_code, $product_name);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows > 0) {
        http_response_code(409); // Conflict
        echo json_encode([
            "status" => "error",
            "message" => "Product with this HSN code or name already exists"
        ]);
        exit;
    }
    $checkStmt->close();

    // ===== Validations =====
    $errors = [];

    if (!$hsn_code) {
        $errors[] = "HSN code is required";
    } elseif (!preg_match("/^\d{6,8}$/", $hsn_code)) {
        $errors[] = "HSN code must be 6–8 digits";
    }

    if (!$product_name) {
        $errors[] = "Product name is required";
    }

    if (!$category) {
        $errors[] = "Category is required";
    }

    if ($quantity === null || !is_int($quantity) || $quantity < 0) {
        $errors[] = "Quantity must be a non-negative integer";
    }

    if (!in_array($status, ["Active", "Inactive"])) {
        $errors[] = "Status must be 'Active' or 'Inactive'";
    }

    if (!empty($errors)) {
        http_response_code(422); // Unprocessable Entity
        echo json_encode(["status" => "error", "errors" => $errors]);
        exit;
    }

    // ===== Generate new product_code =====
    $sql = "SELECT MAX(CAST(SUBSTRING(product_code, 2) AS UNSIGNED)) AS max_code FROM products";
    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Failed to fetch max product code: " . $conn->error);
    }

    $row = $result->fetch_assoc();
    $next_num = ($row['max_code'] ?? 0) + 1;

    // P0000001, P0000002, ...
    $product_code = "P" . str_pad($next_num, 7, "0", STR_PAD_LEFT);

    // ===== Insert record =====
    $insert_sql = "INSERT INTO products (product_code, hsn_code, product_name, category, quantity, status)
                   VALUES (?, ?, ?, ?, ?, ?)";
    $insert_stmt = $conn->prepare($insert_sql);

    if (!$insert_stmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $insert_stmt->bind_param("ssssis", $product_code, $hsn_code, $product_name, $category, $quantity, $status);

    if ($insert_stmt->execute()) {
        http_response_code(201); // Created
        echo json_encode([
            "status" => "success",
            "message" => "Product added successfully",
            "data" => [
                "product_code" => $product_code,
                "hsn_code"     => $hsn_code,
                "product_name" => $product_name,
                "category"     => $category,
                "quantity"     => $quantity,
                "status"       => $status
            ]
        ]);
    } else {
        throw new Exception("Insert failed: " . $insert_stmt->error);
    }

    $insert_stmt->close();
    $conn->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Unexpected server error",
        "details" => $e->getMessage()
    ]);
}
