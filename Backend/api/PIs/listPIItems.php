<?php
require_once("../connect.php");
$sql = "SELECT * FROM purchase_invoice_items";
$result = $conn->query($sql);
$piItems = array();
if ($result->num_rows > 0) {
  while($row = $result->fetch_assoc()) {
    $piItems[] = $row;
  }
}
else{
    $piItems = ["result" => "No PI Items found"];
}
echo json_encode($piItems);
$conn->close();
?>