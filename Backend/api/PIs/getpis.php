<?php
require_once("../connect.php");

$sql = "SELECT * FROM purchase_invoices ORDER BY created_at DESC";
$result = $conn->query($sql);

$purchases = [];
while ($row = $result->fetch_assoc()) {
    // Fetch items for each PI
    $stmt = $conn->prepare("SELECT * FROM purchase_invoice_items WHERE pi_id = ?");
    $stmt->bind_param("i", $row['pi_id']);
    $stmt->execute();
    $items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    $row['items'] = $items;
    $purchases[] = $row;
}

echo json_encode($purchases);
$conn->close();