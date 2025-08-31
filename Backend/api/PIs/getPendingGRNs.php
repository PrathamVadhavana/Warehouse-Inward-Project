<?php
header("Content-Type: application/json");
require_once("../connect.php");

try {
    // Fetch GRNs which don’t have a PI yet
    $sql = "SELECT g.grn_id, g.supplier_id, g.received_date 
            FROM grn g
            LEFT JOIN purchase_invoices pi ON g.grn_id = pi.grn_id
            WHERE pi.grn_id IS NULL AND g.status = 'Pending'";

    $result = $conn->query($sql);
    $grns = [];
    while ($row = $result->fetch_assoc()) {
        $grns[] = $row;
    }

    echo json_encode(["status" => "success", "pending_grns" => $grns]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
$conn->close();
?>