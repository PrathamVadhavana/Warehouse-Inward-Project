<?php
require_once '../connect.php';
header('Content-Type: application/json');

// Get JSON data from frontend
$data = json_decode(file_get_contents("php://input"), true);
$po_id = $data['po_id'] ?? null;

if (!$po_id) {
    echo json_encode(["status" => "error", "message" => "Missing po_id"]);
    exit;
}

// Fetch products for this PO
$sql = "SELECT p.product_id, p.product_name
        FROM purchase_order_items pi
        JOIN products p ON pi.medicine_id = p.product_id
        WHERE pi.po_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $po_id);
$stmt->execute();
$result = $stmt->get_result();

$items = [];
while ($row = $result->fetch_assoc()) {
    $items[] = $row;
}

echo json_encode($items);

$stmt->close();
$conn->close();
?>
