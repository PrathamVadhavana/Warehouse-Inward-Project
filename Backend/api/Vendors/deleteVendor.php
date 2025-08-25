<?php
# delete Vendor
require_once "../connect.php"; 

// Get JSON data from frontend
$data = json_decode(file_get_contents("php://input"), true);
$vendor_id  = $data['vendor_id'] ?? null;
// Validate required fields
if (!$vendor_id) {
    echo json_encode(["status" => "error", "message" => "Missing vendor_id"]);
    exit;
}

// Check if vendor exists
$check_sql = "SELECT vendor_id FROM vendors WHERE vendor_id = ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("s", $vendor_id);
$check_stmt->execute();
$check_stmt->store_result();

if ($check_stmt->num_rows == 0) {
    // Vendor does not exist, send error
    echo json_encode(["status" => "error", "message" => "Vendor not found"]);
} else {
    // Vendor exists, delete it
    $delete_sql = "DELETE FROM vendors WHERE vendor_id = ?";
    $delete_stmt = $conn->prepare($delete_sql);
    $delete_stmt->bind_param("s", $vendor_id);
    if ($delete_stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Vendor deleted successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => $delete_stmt->error]);
    }
    $delete_stmt->close();
    $conn->close();
}