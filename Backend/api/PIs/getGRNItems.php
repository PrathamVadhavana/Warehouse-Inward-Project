<?php
header("Content-Type: application/json");
require_once("../connect.php");

$data = json_decode(file_get_contents("php://input"), true);
$grn_id = $data["grn_id"] ?? null;

if (!$grn_id) {
    echo json_encode(["status" => "error", "message" => "GRN ID is required"]);
    exit;
}

try {
    // Get GRN info including supplier_id
    $grnSql = "SELECT supplier_id FROM grn WHERE grn_id = ?";
    $grnStmt = $conn->prepare($grnSql);
    $grnStmt->bind_param("i", $grn_id);
    $grnStmt->execute();
    $grnResult = $grnStmt->get_result();
    $grn = $grnResult->fetch_assoc();

    if (!$grn) {
        echo json_encode(["status" => "error", "message" => "GRN not found"]);
        exit;
    }

    // Fetch GRN items
    $sql = "SELECT g.product_id, p.product_name, g.received_qty, g.mrp
            FROM grn_items g
            JOIN products p ON g.product_id = p.product_id
            WHERE g.grn_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $grn_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "supplier_id" => $grn["supplier_id"], // ✅ send supplier_id
        "items" => $items
    ]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
$conn->close();
?>
