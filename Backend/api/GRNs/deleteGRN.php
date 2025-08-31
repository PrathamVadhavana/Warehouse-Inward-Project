<?php
header('Content-Type: application/json');
require_once("../connect.php");

// Get GRN ID from POST
$data = json_decode(file_get_contents("php://input"), true);
$grn_id = $data['grn_id'] ?? null;

if (!$grn_id) {
    echo json_encode(["status" => "error", "message" => "Missing GRN ID"]);
    exit;
}

try {
    $stmt = $conn->prepare("DELETE FROM grn WHERE grn_id = ?");
    $stmt->bind_param("i", $grn_id);
    $stmt->execute();

    echo json_encode(["status" => "success", "message" => "GRN deleted successfully"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conn->close();
?>
