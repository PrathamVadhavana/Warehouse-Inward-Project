<?php
header("Content-Type: application/json");
require_once "../connect.php";

$response = ["status" => "error", "message" => "Unknown error occurred"];

try {
    $data = json_decode(file_get_contents("php://input"), true);
    $product_code  = $data['product_code'] ?? null;

    if (!$product_code) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing product_code"]);
        exit;
    }

    // Check if product exists
    $check_sql = "SELECT product_code FROM products WHERE product_code = ? AND deleted_at IS NULL";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("i", $product_code);
    $check_stmt->execute();
    $check_stmt->store_result();

    if ($check_stmt->num_rows == 0) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Product not found or already deleted"]);
    } else {
        // Soft delete → set is_deleted = 1
        $delete_sql = "UPDATE products SET deleted_at = NOW() WHERE product_code = ?";
        $delete_stmt = $conn->prepare($delete_sql);
        $delete_stmt->bind_param("i", $product_code);

        if ($delete_stmt->execute()) {
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Product marked as deleted"]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $delete_stmt->error]);
        }
        $delete_stmt->close();
    }

    $check_stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
