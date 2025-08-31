<?php
require_once("../connect.php");

$sql = "SELECT * FROM vendors ORDER BY updated_at DESC";
$result = $conn->query($sql);
$vendors = array();
if ($result->num_rows > 0) {
  while($row = $result->fetch_assoc()) {
    $vendors[] = $row;
  }
}
else{
    $vendors = ["result" => "No vendors found"];
}
echo json_encode($vendors);
$conn->close();
?>