<?php
require_once "../connect.php";
header("Content-Type: application/json");

try {
    $sql = "SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category <> ''";
    $result = $conn->query($sql);

    $categories = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $categories[] = $row['category'];
        }
    }

    echo json_encode([
        "status" => "success",
        "data" => $categories
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
$conn->close();