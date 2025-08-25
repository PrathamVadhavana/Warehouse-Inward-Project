<?php
require_once("../connect.php");

$sql = "SELECT * FROM products";
$result = $conn->query($sql);
$products = array();
if ($result->num_rows > 0) {
  while($row = $result->fetch_assoc()) {
    $products[] = $row;
  }
}
else{
    $products = ["result" => "No products found"];
}
echo json_encode($products);
$conn->close();
?>