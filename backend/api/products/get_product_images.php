<?php
include '../config/database.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$id = $_GET['product_id'];

$stmt = $con->prepare("SELECT * FROM product_images WHERE product_id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

$images = [];
while ($row = $result->fetch_assoc()) {
    $row['image'] = 'http://localhost/crtv-shots-website/backend/api/uploads/' . $row['image'];
    $images[] = $row;
}

echo json_encode($images);
?>
