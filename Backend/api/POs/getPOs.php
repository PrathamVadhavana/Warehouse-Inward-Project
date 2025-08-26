<?php
require_once("../connect.php");

$sql = "SELECT * FROM purchase_orders";
$result = $conn->query($sql);
$pos = array();
if ($result->num_rows > 0) {
  while($row = $result->fetch_assoc()) {
    $pos[] = $row;
  }
}
else{
    $pos = ["result" => "No POs found"];
}
echo json_encode($pos);
$conn->close();
?>