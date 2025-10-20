<?php
// Simple JSON API for products list
// Method: GET -> returns array of { id, name/title, price, image_url }

header('Content-Type: application/json; charset=utf-8');
// Basic CORS support (adjust origin as needed)
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
    header('Vary: Origin');
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([ 'error' => 'Method Not Allowed' ]);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

// Try a few common column name variants to be resilient
// Prefer columns: id, name, price, image_url; fallback: title, image, photo, img_url
$sql = "SELECT 
            id,
            COALESCE(name, title) AS name,
            price,
            COALESCE(image_url, image, photo, img_url) AS image_url
        FROM products
        ORDER BY id DESC";

$result = mysqli_query($con, $sql);
if ($result === false) {
    http_response_code(500);
    echo json_encode([ 'error' => 'Failed to query products' ]);
    exit;
}

$rows = [];
while ($row = mysqli_fetch_assoc($result)) {
    $rows[] = [
        'id' => isset($row['id']) ? (int)$row['id'] : null,
        'name' => $row['name'] ?? '',
        'price' => isset($row['price']) && is_numeric($row['price']) ? (0 + $row['price']) : $row['price'],
        'image_url' => $row['image_url'] ?? null,
    ];
}

echo json_encode($rows);
