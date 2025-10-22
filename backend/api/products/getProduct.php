<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

require_once __DIR__ . '/../config/database.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'id is required']);
    exit;
}

$sql = "SELECT p.id, p.title, p.slug, p.description, p.price, p.currency, p.status, p.type, p.stock, p.category_id,
        (SELECT url FROM product_images WHERE product_id=p.id ORDER BY sort_order ASC LIMIT 1) AS image_url,
        (SELECT c.name FROM categories c WHERE c.id = p.category_id) AS category_name
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
$row['category_id'] = isset($row['category_id']) ? (int)$row['category_id'] : null;

// Fetch all images for the product
$images = [];
$imgRes = mysqli_query($con, "SELECT url, alt, sort_order FROM product_images WHERE product_id=$id ORDER BY sort_order ASC, id ASC");
if ($imgRes) {
    while ($img = mysqli_fetch_assoc($imgRes)) {
        $images[] = [
            'url' => $img['url'] ?? null,
            'alt' => $img['alt'] ?? '',
            'sort_order' => isset($img['sort_order']) ? (int)$img['sort_order'] : null,
        ];
    }
}
$row['images'] = $images;

echo json_encode($row);
