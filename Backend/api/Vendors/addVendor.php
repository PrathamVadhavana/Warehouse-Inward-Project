<?php
require_once "../connect.php"; // adjust path if needed

// Get JSON data from frontend
$data = json_decode(file_get_contents("php://input"), true);

$vendor_code  = $data['vendor_code'] ?? null;
$vendor_name  = $data['vendor_name'] ?? null;
$contact_person = $data['contact_person'] ?? null;
$contact_number = $data['contact_number'] ?? null;
$gst_number = $data['gst_number'] ?? null;
$address      = $data['address'] ?? null;
$status      = $data['status'] ?? null;

// Validate required fields
if (!$vendor_code || !$contact_person || !$vendor_name  || !$contact_number || !$gst_number || !$address || !$status) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

// Check if vendor already exists
$check_sql = "SELECT vendor_code FROM vendors WHERE vendor_code = ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("s", $vendor_code);
$check_stmt->execute();
$check_stmt->store_result();

if ($check_stmt->num_rows > 0) {
    // Vendor exists, send error
    echo json_encode(["status" => "error", "message" => "Vendor already exists"]);
} else {

    // Vendor does not exist, insert new
    $insert_sql = "INSERT INTO vendors (vendor_code, vendor_name, contact_person, contact_number, gst_number, address, status)
                   VALUES (?, ?, ?, ?, ?, ?, ?)";
    $insert_stmt = $conn->prepare($insert_sql);
    $insert_stmt->bind_param("sssssss", $vendor_code, $vendor_name, $contact_person, $contact_number, $gst_number, $address, $status);

    if ($insert_stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Vendor added successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => $insert_stmt->error]);
    }
    $insert_stmt->close();
}

$check_stmt->close();
$conn->close();
?>
