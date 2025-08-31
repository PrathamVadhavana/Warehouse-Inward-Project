<?php
require_once '../connect.php';
header('Content-Type: application/json');

// Fetch all pending purchase orders with details
$sql = "SELECT po_id, supplier_id, po_date, expected_date, status 
        FROM purchase_orders 
        WHERE status = 'Pending'";
$result = $conn->query($sql);

$pendingPOs = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $pendingPOs[] = $row; // return full object, not just ID
    }
}

echo json_encode([
    "status" => "success",
    "pending_pos" => $pendingPOs
]);

$conn->close();
?>
