<?php
header('Content-Type: application/json');
require_once("../connect.php"); 

$data = json_decode(file_get_contents("php://input"), true);

$po_id = $data['po_id'] ?? null;
$grn_date = $data['grn_date'] ?? null;
$items = $data['items'] ?? [];

if (!$po_id || !$grn_date || empty($items)) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

try {
    $conn->begin_transaction();

    // 1️⃣ Fetch supplier_id from purchase_orders
    $stmt = $conn->prepare("SELECT supplier_id FROM purchase_orders WHERE po_id = ?");
    $stmt->bind_param("i", $po_id);
    $stmt->execute();
    $res = $stmt->get_result();
    $po = $res->fetch_assoc();
    if (!$po) throw new Exception("PO not found");

    $supplier_id = $po['supplier_id'];

    // initialize total_amount
    $total_amount = 0;

    // 2️⃣ Insert into grn (initially with total_amount = 0)
    $stmt = $conn->prepare("INSERT INTO grn (po_id, supplier_id, received_date, total_amount, status) VALUES (?, ?, ?, ?, 'Pending')");
    $stmt->bind_param("iisd", $po_id, $supplier_id, $grn_date, $total_amount);
    $stmt->execute();
    $grn_id = $stmt->insert_id;

    // 3️⃣ Fetch PO item quantities & rates for validation
    $poItemStmt = $conn->prepare("SELECT medicine_id, quantity, rate FROM purchase_order_items WHERE po_id = ?");
    $poItemStmt->bind_param("i", $po_id);
    $poItemStmt->execute();
    $poItemRes = $poItemStmt->get_result();
    $poQuantities = [];
    while ($row = $poItemRes->fetch_assoc()) {
        $poQuantities[$row['medicine_id']] = [
            "quantity" => $row['quantity'],
            "rate" => $row['rate']
        ];
    }

    // 4️⃣ Insert GRN items & validate
    $grnItemStmt = $conn->prepare("INSERT INTO grn_items (grn_id, product_id, received_qty, damaged_qty, batch_no, expiry, mrp) VALUES (?, ?, ?, ?, ?, ?, ?)");

    foreach ($items as $item) {
        $medId = $item['medicine_id'];
        $received = $item['received_qty'] ?? 0;
        $damaged = $item['damaged_qty'] ?? 0;
        $mrp = $item['mrp'] ?? 0;
        $batch = $item['batch_no'] ?? null;
        $expiry = $item['expiry'] ?? null;

        if (!isset($poQuantities[$medId])) {
            throw new Exception("Medicine ID $medId not in PO");
        }

        $poQty = $poQuantities[$medId]['quantity'];
        $prevRate = $poQuantities[$medId]['rate'];

        if ($received + $damaged > $poQty) {
            throw new Exception("Total quantity for medicine ID $medId exceeds PO quantity ($poQty)");
        }

        if ($mrp > $prevRate * 1.2) {
            throw new Exception("MRP for medicine ID $medId exceeds 120% of previous purchase rate ($prevRate)");
        }

        $grnItemStmt->bind_param("iiiissd", $grn_id, $medId, $received, $damaged, $batch, $expiry, $mrp);
        $grnItemStmt->execute();

        // ✅ add to total amount (only count received, not damaged)
        $total_amount += $received * $mrp;

        // 5️⃣ Update stock (simulate inward)
        $conn->query("UPDATE products SET quantity = quantity + $received WHERE product_id = $medId");
    }

    // 6️⃣ Update total_amount in GRN
    $stmt = $conn->prepare("UPDATE grn SET total_amount = ? WHERE grn_id = ?");
    $stmt->bind_param("di", $total_amount, $grn_id);
    $stmt->execute();

    // 7️⃣ Check if GRN fully received → update GRN status
    $stmt = $conn->prepare("SELECT SUM(received_qty + damaged_qty) as total_received, product_id 
                            FROM grn_items WHERE grn_id = ? GROUP BY product_id");
    $stmt->bind_param("i", $grn_id);
    $stmt->execute();
    $res = $stmt->get_result();

    $fullyReceived = true;
    while ($row = $res->fetch_assoc()) {
        $medId = $row['product_id'];
        $receivedTotal = $row['total_received'];
        if ($receivedTotal < $poQuantities[$medId]['quantity']) {
            $fullyReceived = false;
        }
    }

    if ($fullyReceived) {
        // ✅ Mark GRN as Completed
        $conn->query("UPDATE grn SET status = 'Completed' WHERE grn_id = $grn_id");

        // ✅ Also mark PO as Completed
        $conn->query("UPDATE purchase_orders SET status = 'Completed' WHERE po_id = $po_id");
    } else {
        // Otherwise keep GRN pending and PO as Partially Received
        $conn->query("UPDATE grn SET status = 'Pending' WHERE grn_id = $grn_id");
        $conn->query("UPDATE purchase_orders SET status = 'Partially Received' WHERE po_id = $po_id");
    }

    $conn->commit();
    echo json_encode([
        "status" => "success", 
        "message" => "GRN created successfully",
        "grn_id" => $grn_id,
        "total_amount" => $total_amount
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conn->close();
