<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
require_once("../connect.php");

$data = json_decode(file_get_contents("php://input"), true);

$pi_id = $data['pi_id'] ?? null;
$invoice_no = $data['invoice_no'] ?? null;
$invoice_date = $data['invoice_date'] ?? null;
$status = $data['status'] ?? "Pending";
$items = $data['items'] ?? [];

if (!$pi_id || !$invoice_no || !$invoice_date || empty($items)) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

try {
    $conn->begin_transaction();

    // Calculate total amount
    $total_amount = 0;
    foreach ($items as $item) {
        $qty = floatval($item['quantity']);
        $rate = floatval($item['rate']);
        $amount = $qty * $rate;
        $total_amount += $amount;
    }

    // Update PI table
    $stmt = $conn->prepare("UPDATE purchase_invoices 
        SET invoice_no = ?, invoice_date = ?, total_amount = ?, status = ?, updated_at = NOW()
        WHERE pi_id = ?");
    $stmt->bind_param("ssdsi", $invoice_no, $invoice_date, $total_amount, $status, $pi_id);
    $stmt->execute();

    // Delete old items (simpler than updating each)
    $conn->query("DELETE FROM purchase_invoice_items WHERE pi_id = $pi_id");

    // Insert updated items
    $itemStmt = $conn->prepare("INSERT INTO purchase_invoice_items (pi_id, product_id, quantity, rate, amount) 
                                VALUES (?, ?, ?, ?, ?)");
    foreach ($items as $item) {
        $pid = intval($item['product_id']);
        $qty = floatval($item['quantity']);
        $rate = floatval($item['rate']);
        $amount = $qty * $rate;
        $itemStmt->bind_param("iiidd", $pi_id, $pid, $qty, $rate, $amount);
        $itemStmt->execute();
    }

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "PI updated successfully"]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conn->close();
?>