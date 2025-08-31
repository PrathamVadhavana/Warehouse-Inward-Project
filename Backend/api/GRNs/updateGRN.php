<?php
header('Content-Type: application/json');
require_once("../connect.php");

$data = json_decode(file_get_contents("php://input"), true);

$grn_id = $data['grn_id'] ?? null;
$received_date = $data['received_date'] ?? null;
$items = $data['items'] ?? [];

if (!$grn_id || !$received_date || empty($items)) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

try {
    $conn->begin_transaction();

    // Update GRN date
    $stmt = $conn->prepare("UPDATE grn SET received_date = ? WHERE grn_id = ?");
    $stmt->bind_param("si", $received_date, $grn_id);
    $stmt->execute();

    // Fetch PO items for validation
    $poStmt = $conn->prepare(
        "SELECT poi.medicine_id, poi.quantity, poi.rate
        FROM purchase_order_items poi
        JOIN grn g ON g.po_id = poi.po_id
        WHERE g.grn_id = ?"
    );
    $poStmt->bind_param("i", $grn_id);
    $poStmt->execute();
    $poRes = $poStmt->get_result();

    $poItems = [];
    while ($row = $poRes->fetch_assoc()) {
        $poItems[$row['medicine_id']] = [
            "quantity" => $row['quantity'],
            "rate" => $row['rate']
        ];
    }

    // Update GRN items
    foreach ($items as $item) {
        $medId = $item['medicine_id'];
        $received = $item['received_qty'] ?? 0;
        $damaged = $item['damaged_qty'] ?? 0;
        $batch = $item['batch_no'] ?? null;
        $expiry = $item['expiry'] ?? null;
        $mrp = $item['mrp'] ?? 0;

        if (!isset($poItems[$medId])) throw new Exception("Medicine ID $medId not in PO");

        $poQty = $poItems[$medId]['quantity'];
        $prevRate = $poItems[$medId]['rate'];

        if ($received + $damaged > $poQty) throw new Exception("Total quantity exceeds PO quantity ($poQty)");
        if ($mrp > $prevRate * 1.2) throw new Exception("MRP exceeds 120% of previous rate ($prevRate)");

        $stmt = $conn->prepare(
            "UPDATE grn_items SET received_qty=?, damaged_qty=?, batch_no=?, expiry=?, mrp=? WHERE grn_id=? AND product_id=?"
        );
        $stmt->bind_param("iissdii", $received, $damaged, $batch, $expiry, $mrp, $grn_id, $medId);
        $stmt->execute();

        // Simulate stock update (optional)
        $conn->query("UPDATE products SET quantity = quantity + $received WHERE product_id = $medId");
    }

    // Update GRN status if all received
    $allReceived = true;
    foreach ($poItems as $id => $poItem) {
        $stmt = $conn->prepare("SELECT received_qty + damaged_qty as total FROM grn_items WHERE grn_id=? AND product_id=?");
        $stmt->bind_param("ii", $grn_id, $id);
        $stmt->execute();
        $res = $stmt->get_result()->fetch_assoc();
        if ($res['total'] < $poItem['quantity']) $allReceived = false;
    }

    $status = $allReceived ? 'Completed' : 'Pending';
    $stmt = $conn->prepare("UPDATE grn SET status=? WHERE grn_id=?");
    $stmt->bind_param("si", $status, $grn_id);
    $stmt->execute();

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "GRN updated successfully"]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conn->close();
