<?php
require_once("../connect.php");

// Get JSON data from frontend
$data = json_decode(file_get_contents("php://input"), true);

$po_id = $data['po_id'] ?? null;
$supplier_id = $data['supplier_id'] ?? null;
$po_date = $data['po_date'] ?? null;
$expected_date = $data['expected_date'] ?? null;
$status = $data['status'] ?? 'Pending';
$items = $data['items'] ?? []; // array of items: medicine_id, quantity, rate

// Validate required fields
if (!$po_id || !$supplier_id || !$po_date || !$expected_date || !$status) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

// Begin transaction
$conn->begin_transaction();

try {
    // Update PO main details
    $update_po_sql = "UPDATE purchase_orders SET supplier_id = ?, po_date = ?, expected_date = ?, status = ? WHERE po_id = ?";
    $stmt = $conn->prepare($update_po_sql);
    $stmt->bind_param("isssi", $supplier_id, $po_date, $expected_date, $status, $po_id);
    $stmt->execute();
    $stmt->close();

    // Optional: update PO items
    if (!empty($items)) {
        // Delete existing items
        $del_sql = "DELETE FROM purchase_order_items WHERE po_id = ?";
        $del_stmt = $conn->prepare($del_sql);
        $del_stmt->bind_param("i", $po_id);
        $del_stmt->execute();
        $del_stmt->close();

        // Insert new items
        $insert_sql = "INSERT INTO purchase_order_items (po_id, medicine_id, quantity, rate) VALUES (?, ?, ?, ?)";
        $insert_stmt = $conn->prepare($insert_sql);
        foreach ($items as $item) {
            $medicine_id = $item['medicine_id'] ?? null;
            $quantity = isset($item['quantity']) ? (int)$item['quantity'] : 0;
            $rate = isset($item['rate']) ? (float)$item['rate'] : 0.0;

            if ($medicine_id) {
                $insert_stmt->bind_param("iiid", $po_id, $medicine_id, $quantity, $rate);
                $insert_stmt->execute();
            }
        }
        $insert_stmt->close();
    }

    // Commit transaction
    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Purchase Order updated successfully"]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conn->close();
?>
