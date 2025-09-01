<?php
header("Access-Control-Allow-Origin: *"); // Allow all origins 
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight (OPTIONS) request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once("../connect.php");

try {
    // Check request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405); // Method not allowed
        echo json_encode([
            "status" => "error",
            "message" => "Invalid request method. Use POST."
        ]);
        exit;
    }

    // Get JSON input
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !isset($data['search'])) {
        http_response_code(400); // Bad request
        echo json_encode([
            "status" => "error",
            "message" => "Missing 'search' parameter in request."
        ]);
        exit;
    }

    $search = trim($data['search']);
    if ($search === "") {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Search term cannot be empty."
        ]);
        exit;
    }

    // Build query
    $sql = "SELECT product_id, product_name, product_code, hsn_code, category, quantity, status, created_at, updated_at
            FROM products
            WHERE is_deleted = 0
              AND (product_name LIKE ? OR product_code LIKE ? OR hsn_code LIKE ?)";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Failed to prepare SQL: " . $conn->error);
    }

    $like = "%" . $search . "%";
    $stmt->bind_param("sss", $like, $like, $like);

    if (!$stmt->execute()) {
        throw new Exception("Query execution failed: " . $stmt->error);
    }

    $result = $stmt->get_result();
    $products = [];

    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }

    if (empty($products)) {
        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "No products found matching '$search'."
        ]);
        exit;
    }

    // Success response
    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "message" => "Products found.",
        "data" => $products
    ]);

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Server error: " . $e->getMessage()
    ]);
}
