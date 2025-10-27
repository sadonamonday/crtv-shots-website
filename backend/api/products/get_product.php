<?php
include '../config/database.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

if (!isset($_GET['id'])) {
    echo json_encode(['error' => 'Product ID is required']);
    exit;
}

$id = intval($_GET['id']);

$stmt = $con->prepare("SELECT * FROM products WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$product = $result->fetch_assoc();

if ($product) {
    $product['image'] = 'http://localhost/crtv-shots-website/backend/api/uploads/' . $product['image'];
    echo json_encode($product);
} else {
    echo json_encode(['error' => 'Product not found']);
}
?>
