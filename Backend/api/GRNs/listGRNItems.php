<?php
require_once("../connect.php");
$sql = "SELECT * FROM grn_items";
$result = $conn->query($sql);
$grnItems = array();
if ($result->num_rows > 0) {
  while($row = $result->fetch_assoc()) {
    $grnItems[] = $row;
  }
}
else{
    $grnItems = ["result" => "No GRN Items found"];
}
echo json_encode($grnItems);
$conn->close();
?>