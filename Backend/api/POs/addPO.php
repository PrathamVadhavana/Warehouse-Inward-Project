<?php
require_once "../connect.php"; 

// Get JSON data from frontend
$data = json_decode(file_get_contents("php://input"), true);

$supplier_id   = $data['supplier_id'] ?? null;
$po_date       = $data['po_date'] ?? null;
$expected_date = $data['expected_date'] ?? null;
$status        = $data['status'] ?? 'Pending'; // default to Pending
$items         = $data['items'] ?? []; // array of items: [{medicine_id, quantity, rate}, ...]

// Validate required fields
if (!$supplier_id || !$po_date || !$expected_date || empty($items)) {
    echo json_encode(["status" => "error", "message" => "Missing required fields or no items provided"]);
    exit;
}

// Optional: Check if supplier exists
$check_supplier_sql = "SELECT vendor_id FROM vendors WHERE vendor_id = ?";
$check_supplier_stmt = $conn->prepare($check_supplier_sql);
$check_supplier_stmt->bind_param("i", $supplier_id);
$check_supplier_stmt->execute();
$check_supplier_stmt->store_result();

if ($check_supplier_stmt->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Supplier does not exist"]);
    exit;
}

// Update supplier status to 'Active' if not already
$update_supplier_sql = "UPDATE vendors SET status = 'Active' WHERE vendor_id = ? AND status != 'Active'";
$update_supplier_stmt = $conn->prepare($update_supplier_sql);
$update_supplier_stmt->bind_param("i", $supplier_id);
$update_supplier_stmt->execute();
$update_supplier_stmt->close();

// Update product status to 'Active' for all medicines in the PO
$medicine_ids = array_column($items, 'medicine_id');
if (!empty($medicine_ids)) {
    $placeholders = implode(',', array_fill(0, count($medicine_ids), '?'));
    $types = str_repeat('i', count($medicine_ids));

    $update_product_sql = "UPDATE products SET status = 'Active' WHERE product_id IN ($placeholders) AND status != 'Active'";
    $update_product_stmt = $conn->prepare($update_product_sql);
    $update_product_stmt->bind_param($types, ...$medicine_ids);
    $update_product_stmt->execute();
    $update_product_stmt->close();
}

// Insert new Purchase Order
$insert_po_sql = "INSERT INTO purchase_orders (supplier_id, po_date, expected_date, status)
                  VALUES (?, ?, ?, ?)";
$insert_po_stmt = $conn->prepare($insert_po_sql);
$insert_po_stmt->bind_param("isss", $supplier_id, $po_date, $expected_date, $status);

if ($insert_po_stmt->execute()) {
    $po_id = $insert_po_stmt->insert_id; // get the newly created PO ID

    // Insert items for this PO
    $insert_item_sql = "INSERT INTO purchase_order_items (po_id, medicine_id, quantity, rate) VALUES (?, ?, ?, ?)";
    $insert_item_stmt = $conn->prepare($insert_item_sql);

    foreach ($items as $item) {
        $medicine_id = $item['medicine_id'];
        $quantity    = $item['quantity'];
        $rate        = $item['rate'];

        // Optional: Validate medicine exists
        $check_medicine_sql = "SELECT product_id FROM products WHERE product_id = ?";
        $check_medicine_stmt = $conn->prepare($check_medicine_sql);
        $check_medicine_stmt->bind_param("i", $medicine_id);
        $check_medicine_stmt->execute();
        $check_medicine_stmt->store_result();

        if ($check_medicine_stmt->num_rows === 0) {
            echo json_encode(["status" => "error", "message" => "Medicine ID $medicine_id does not exist"]);
            exit;
        }

        $check_medicine_stmt->close();

        $insert_item_stmt->bind_param("iiid", $po_id, $medicine_id, $quantity, $rate);
        $insert_item_stmt->execute();
    }

    $insert_item_stmt->close();

    echo json_encode(["status" => "success", "message" => "Purchase Order created successfully", "po_id" => $po_id]);
} else {
    echo json_encode(["status" => "error", "message" => $insert_po_stmt->error]);
}

$insert_po_stmt->close();
$check_supplier_stmt->close();
$conn->close();
?>
