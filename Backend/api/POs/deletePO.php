<?php
# Delete Purchase Order
require_once "../connect.php"; 

// Get JSON data from frontend
$data = json_decode(file_get_contents("php://input"), true);
$po_id  = $data['po_id'] ?? null;

// Validate required fields
if (!$po_id) {
    echo json_encode(["status" => "error", "message" => "Missing po_id"]);
    exit;
}

// Check if PO exists
$check_sql = "SELECT po_id FROM purchase_orders WHERE po_id = ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("i", $po_id);
$check_stmt->execute();
$check_stmt->store_result();

if ($check_stmt->num_rows == 0) {
    // PO does not exist
    echo json_encode(["status" => "error", "message" => "Purchase Order not found"]);
} else {
    // PO exists, delete it (items will be deleted automatically via ON DELETE CASCADE)
    $delete_sql = "DELETE FROM purchase_orders WHERE po_id = ?";
    $delete_stmt = $conn->prepare($delete_sql);
    $delete_stmt->bind_param("i", $po_id);

    if ($delete_stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Purchase Order deleted successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => $delete_stmt->error]);
    }
    $delete_stmt->close();
}

$check_stmt->close();
$conn->close();
?>
