<?php
require_once("../connect.php");

// Always return JSON
header("Content-Type: application/json");

try {
    // Get JSON data from frontend
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        http_response_code(400); // Bad Request
        echo json_encode([
            "status" => "error",
            "code"   => 400,
            "message"=> "Invalid JSON input"
        ]);
        exit;
    }

    $product_code  = $data['product_code'] ?? null;
    $hsn_code      = $data['hsn_code'] ?? null;
    $product_name  = $data['product_name'] ?? null;
    $category      = $data['category'] ?? null;
    $quantity      = isset($data['quantity']) ? (int)$data['quantity'] : null;
    $status        = $data['status'] ?? null;

    // Validate required fields
    if (!$product_code || !$hsn_code || !$product_name || !$category || $quantity === null) {
        http_response_code(422); // Unprocessable Entity
        echo json_encode([
            "status" => "error",
            "code"   => 422,
            "message"=> "Missing required fields"
        ]);
        exit;
    }

    // Prepare update statement
    $update_sql = "UPDATE products 
                   SET hsn_code = ?, product_name = ?, category = ?, quantity = ?, status = ?, updated_at = NOW() 
                   WHERE product_code = ?";
    $update_stmt = $conn->prepare($update_sql);

    if (!$update_stmt) {
        http_response_code(500); // Internal Server Error
        echo json_encode([
            "status" => "error",
            "code"   => 500,
            "message"=> "Failed to prepare statement"
        ]);
        exit;
    }

    $update_stmt->bind_param("sssiss", $hsn_code, $product_name, $category, $quantity, $status, $product_code);

    if ($update_stmt->execute()) {
        if ($update_stmt->affected_rows > 0) {
            http_response_code(200); // OK
            echo json_encode([
                "status" => "success",
                "code"   => 200,
                "message"=> "Product updated successfully"
            ]);
        } else {
            http_response_code(404); // Not Found or No Changes
            echo json_encode([
                "status" => "error",
                "code"   => 404,
                "message"=> "No changes made or product not found"
            ]);
        }
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode([
            "status" => "error",
            "code"   => 500,
            "message"=> $update_stmt->error
        ]);
    }

    $update_stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode([
        "status" => "error",
        "code"   => 500,
        "message"=> "Unexpected server error",
        "details"=> $e->getMessage()
    ]);
}
