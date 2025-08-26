<?php
require_once("../connect.php");
$sql = "SELECT * FROM purchase_order_items";
$result = $conn->query($sql);
$poitems = array();
if ($result->num_rows > 0) {
  while($row = $result->fetch_assoc()) {
    $poitems[] = $row;
  }
}
else{
    $poitems = ["result" => "No PO Items found"];
}
echo json_encode($poitems);
$conn->close();
?>