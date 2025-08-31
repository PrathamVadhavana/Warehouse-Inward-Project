<?php
require_once("../connect.php");

$data = json_decode(file_get_contents("php://input"), true);
$pi_id = $data['pi_id'] ?? null;

if (!$pi_id) {
    echo json_encode(["status" => "error", "message" => "Missing PI ID"]);
    exit;
}

// Delete PI
$sql = "DELETE FROM purchase_invoices WHERE pi_id = ?";
$stmt = $conn->prepare($sql);
if ($stmt->execute([$pi_id])) {
    echo json_encode(["status" => "success", "message" => "PI deleted"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to delete PI"]);
}
$stmt->close();
$conn->close();
?>