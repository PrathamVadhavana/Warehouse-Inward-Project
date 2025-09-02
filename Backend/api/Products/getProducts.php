<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once("../connect.php");

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode([
            "status" => "error",
            "message" => "Invalid request method. Use GET."
        ]);
        exit;
    }

    // Pagination params
    $page = isset($_GET['page']) ? max((int)$_GET['page'], 1) : 1;
    $limit = isset($_GET['limit']) ? max((int)$_GET['limit'], 15) : 15;
    $offset = ($page - 1) * $limit;

    // Dynamic WHERE clause
    $where = "WHERE is_deleted = 0";
    $params = [];
    $types = "";

    // Fetch products
    $sql = "SELECT product_id, product_name, product_code, hsn_code, category, quantity, status, created_at, updated_at 
            FROM products 
            $where 
            ORDER BY updated_at DESC 
            LIMIT ? OFFSET ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);

    $typesWithPagination = $types . "ii";
    $paramsWithPagination = array_merge($params, [$limit, $offset]);
    $stmt->bind_param($typesWithPagination, ...$paramsWithPagination);

    if (!$stmt->execute()) throw new Exception("Execution failed: " . $stmt->error);

    $result = $stmt->get_result();
    $products = $result->fetch_all(MYSQLI_ASSOC);

    // Count total
    $countSql = "SELECT COUNT(*) as total FROM products $where";
    $countStmt = $conn->prepare($countSql);
    if (!$countStmt) throw new Exception("Prepare count failed: " . $conn->error);
    if ($types !== "") $countStmt->bind_param($types, ...$params);
    if (!$countStmt->execute()) throw new Exception("Count execution failed: " . $countStmt->error);

    $countRes = $countStmt->get_result();
    $total = (int)$countRes->fetch_assoc()['total'];

    // Response
    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "message" => count($products) ? "Products found." : "No products found.",
        "data" => $products,
        "total" => $total,
        "page" => $page,
        "limit" => $limit
    ]);

    $stmt->close();
    $countStmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Server error: " . $e->getMessage()
    ]);
}
