<?php
require_once("../connect.php");

$data = json_decode(file_get_contents("php://input"), true);
$grn_id = $data['grn_id'] ?? null;

if (!$grn_id) {
    echo json_encode([]);
    exit;
}

// Join grn_items with products/medicines to get details
$sql = "SELECT gi.grn_item_id, gi.product_id, m.product_name, gi.received_qty, gi.damaged_qty, gi.batch_no, gi.expiry, gi.mrp
        FROM grn_items gi
        JOIN products m ON gi.product_id = m.product_id
        WHERE gi.grn_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $grn_id);
$stmt->execute();
$result = $stmt->get_result();

$items = [];
while ($row = $result->fetch_assoc()) {
    $items[] = $row;
}

echo json_encode($items);
$conn->close();
?>