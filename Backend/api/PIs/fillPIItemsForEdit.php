<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
require_once("../connect.php");

$data = json_decode(file_get_contents("php://input"), true);
$pi_id = $data['pi_id'] ?? null;

if (!$pi_id) {
    echo json_encode(["status" => "error", "message" => "PI ID required"]);
    exit;
}

try {
    $stmt = $conn->prepare("
        SELECT pii.id, pii.product_id, p.product_name, pii.quantity, pii.rate, pii.amount
        FROM purchase_invoice_items pii
        JOIN products p ON pii.product_id = p.product_id
        WHERE pii.pi_id = ?
    ");
    $stmt->bind_param("i", $pi_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }

    echo json_encode($items);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conn->close();
?>