<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once("../connect.php");

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode([
            "status" => "error",
            "message" => "Invalid request method. Use POST."
        ]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    // ✅ Input
    $search = isset($data['search']) ? trim($data['search']) : "";
    $searchField = isset($data['search_field']) ? trim($data['search_field']) : "";
    $status = isset($data['status']) ? trim($data['status']) : "";

    // ✅ Pagination
    $page = isset($data['page']) && is_numeric($data['page']) ? (int)$data['page'] : 1;
    $limit = isset($data['limit']) && is_numeric($data['limit']) ? (int)$data['limit'] : 10;
    $offset = ($page - 1) * $limit;

    // ✅ Allow only specific fields (prevent SQL injection)
    $allowedFields = ["vendor_name", "contact_person", "contact_number", "gst_number", "status"];
    if (!in_array($searchField, $allowedFields)) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Invalid search field"
        ]);
        exit;
    }

    // ✅ Main query
    $where = "WHERE deleted_at IS NULL AND $searchField LIKE ?";
    $params = [];
    $types = "s";
    $like = "%" . $search . "%";
    $params[] = $like;

    if ($status !== "") {
        $where .= " AND status = ?";
        $params[] = $status;
        $types .= "s";
    }

    $sql = "SELECT vendor_code, vendor_name, contact_person, contact_number, gst_number, address, status, created_at, updated_at
            FROM vendors
            $where
            ORDER BY updated_at DESC
            LIMIT ? OFFSET ?";
    $types .= "ii";
    $params[] = $limit;
    $params[] = $offset;

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Failed to prepare SQL: " . $conn->error);
    }
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();

    $vendors = [];
    while ($row = $result->fetch_assoc()) {
        $vendors[] = $row;
    }

    // ✅ Count query
    $countSql = "SELECT COUNT(*) as total FROM vendors $where";
    $countStmt = $conn->prepare($countSql);
    $countTypes = substr($types, 0, -2); // remove "ii"
    $countParams = array_slice($params, 0, count($params) - 2);
    $countStmt->bind_param($countTypes, ...$countParams);
    $countStmt->execute();
    $countResult = $countStmt->get_result()->fetch_assoc();
    $totalRecords = $countResult['total'];
    $totalPages = ceil($totalRecords / $limit);

    echo json_encode([
        "status" => "success",
        "data" => $vendors,
        "pagination" => [
            "totalRecords" => $totalRecords,
            "totalPages" => $totalPages,
            "currentPage" => $page,
            "limit" => $limit
        ]
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
