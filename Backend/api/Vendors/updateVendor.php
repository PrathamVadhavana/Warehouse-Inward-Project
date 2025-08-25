<?php
require_once("../connect.php");
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
// Update vendor details
$update_sql = "UPDATE vendors SET vendor_code = ?, vendor_name = ?, contact_person = ?, contact_number = ?, gst_number = ?, status = ?, address = ? WHERE vendor_code = ?";
$update_stmt = $conn->prepare($update_sql);
$update_stmt->bind_param(
    "ssssssss",
    $vendor_code,
    $vendor_name,
    $contact_person,
    $contact_number,
    $gst_number,
    $status,
    $address,
    $vendor_code
);
if ($update_stmt->execute()) {
    if ($update_stmt->affected_rows > 0) {
        echo json_encode(["status" => "success", "message" => "Vendor updated successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "No changes made or vendor not found"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => $update_stmt->error]);
}
$update_stmt->close();
$conn->close();

?>