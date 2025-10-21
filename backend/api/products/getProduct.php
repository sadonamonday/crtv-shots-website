<?php
require_once __DIR__ . '/../utils/cors.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'id is required']);
    exit;
}

$sql = "SELECT p.id, p.title, p.slug, p.description, p.price, p.currency, p.status, p.type, p.stock,
        (SELECT url FROM product_images WHERE product_id=p.id ORDER BY sort_order ASC LIMIT 1) AS image_url
        FROM products p WHERE p.id=$id LIMIT 1";

$res = mysqli_query($con, $sql);
if ($res === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to query product']);
    exit;
}

$row = mysqli_fetch_assoc($res);
if (!$row) {
    http_response_code(404);
    echo json_encode(['error' => 'Product not found']);
    exit;
}

$row['id'] = (int)$row['id'];
$row['price'] = isset($row['price']) && is_numeric($row['price']) ? (0 + $row['price']) : $row['price'];
$row['stock'] = isset($row['stock']) ? (int)$row['stock'] : null;

echo json_encode($row);
