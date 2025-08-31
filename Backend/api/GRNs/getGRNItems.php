<?php
require_once("../connect.php");

// Get JSON data from frontend
$data = json_decode(file_get_contents("php://input"), true);

$po_id = $data['po_id'] ?? null;
if (!$po_id) {
    echo json_encode(["status" => "error", "message" => "Missing po_id"]);
    exit;
}

$sql = "SELECT medicine_id, quantity, rate FROM purchase_order_items WHERE po_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $po_id);
$stmt->execute();
$result = $stmt->get_result();

$items = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $items[] = $row;
    }
} else {
    $items = ["result" => "No items found for this PO"];
}
echo json_encode($items);
$stmt->close();
$conn->close();
?>