<?php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// For preflight OPTIONS request (important for POST APIs)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");
require_once("../connect.php");

$data = json_decode(file_get_contents("php://input"), true);

$supplier_id   = $data["supplier_id"] ?? null;
$grn_id        = $data["grn_id"] ?? null;
$invoice_date  = $data["invoice_date"] ?? null;
$invoice_no    = $data["invoice_no"] ?? null;
$total_amount  = $data["total_amount"] ?? 0;
$items         = $data["items"] ?? [];
$status        = $data["status"] || "Pending"; // default status

if (!$supplier_id || !$grn_id || !$invoice_date || !$invoice_no || empty($items)) {
    echo json_encode(["status" => "error", "message" => "All fields are required"]);
    exit;
}

try {
    $conn->begin_transaction();

    // 🔹 Insert into purchase_invoices
    $sql = "INSERT INTO purchase_invoices (supplier_id, grn_id, invoice_date, invoice_no, total_amount, status, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iissis", $supplier_id, $grn_id, $invoice_date, $invoice_no, $total_amount, $status);
    $stmt->execute();
    $pi_id = $conn->insert_id;

    // 🔹 Insert into purchase_invoice_items
    $sqlItem = "INSERT INTO purchase_invoice_items (pi_id, product_id, quantity, rate, amount) 
                VALUES (?, ?, ?, ?, ?)";
    $stmtItem = $conn->prepare($sqlItem);

    foreach ($items as $item) {
        $product_id = $item["product_id"];
        $quantity   = $item["quantity"];
        $rate       = $item["rate"];
        $amount     = $item["amount"];
        $stmtItem->bind_param("iiidd", $pi_id, $product_id, $quantity, $rate, $amount);
        $stmtItem->execute();
    }

    // 🔹 Update GRN with total_amount + mark as invoiced
    $sqlUpdateGRN = "UPDATE grn SET total_amount = ?, status = 'Completed', updated_at = NOW() WHERE grn_id = ?";
    $stmtUpdate = $conn->prepare($sqlUpdateGRN);
    $stmtUpdate->bind_param("di", $total_amount, $grn_id);
    $stmtUpdate->execute();

    $conn->commit();

    echo json_encode([
        "status" => "success",
        "message" => "Purchase Invoice created successfully",
        "pi_id" => $pi_id
    ]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conn->close();
