<?php
require_once("../connect.php");

$data = json_decode(file_get_contents("php://input"), true);

$pi_id        = $data['pi_id'] ?? null;
$invoice_date = $data['invoice_date'] ?? null;
$total_amount = $data['total_amount'] ?? 0;
$items        = $data['items'] ?? [];

if (!$pi_id || !$invoice_date || empty($items)) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

$conn->begin_transaction();

try {
    // Update PI main details
    $stmt = $conn->prepare("UPDATE purchase_invoices SET invoice_date = ?, total_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE pi_id = ?");
    $stmt->bind_param("sdi", $invoice_date, $total_amount, $pi_id);
    $stmt->execute();
    $stmt->close();

    // Delete old items
    $stmt = $conn->prepare("DELETE FROM purchase_invoice_items WHERE pi_id = ?");
    $stmt->bind_param("i", $pi_id);
    $stmt->execute();
    $stmt->close();

    // Insert new items
    $stmt = $conn->prepare("INSERT INTO purchase_invoice_items (pi_id, product_id, quantity, rate) VALUES (?, ?, ?, ?)");
    foreach ($items as $item) {
        $product_id = $item['product_id'];
        $quantity   = $item['quantity'];
        $rate       = $item['rate'];
        $stmt->bind_param("iiid", $pi_id, $product_id, $quantity, $rate);
        $stmt->execute();
    }
    $stmt->close();

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "PI updated successfully"]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
