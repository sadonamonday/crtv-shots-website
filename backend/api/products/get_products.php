<?php
include '../config/database.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$sql = "SELECT * FROM products ORDER BY created_at DESC";
$result = $con->query($sql);

$products = [];

if ($result && $result->num_rows > 0) {
  while ($row = $result->fetch_assoc()) {
    // Adjust image path for frontend
    $row['image'] = 'http://localhost/crtv-shots-website/backend/api/uploads/' . $row['image'];
    $products[] = $row;
  }
}

echo json_encode($products);
?>
