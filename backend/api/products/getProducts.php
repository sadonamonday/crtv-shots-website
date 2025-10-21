<?php
// Simple JSON API for products list
// Method: GET -> returns array of { id, title, price, image_url }

require_once __DIR__ . '/../utils/cors.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([ 'error' => 'Method Not Allowed' ]);
    exit;
}

// Correct path to database config
require_once __DIR__ . '/../config/database.php';

if (!isset($con) || $con === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Align with new schema: products(id, category_id, title, slug, description, price, currency, status, type, stock, created_at, updated_at)
// and product_images(id, product_id, url, alt, sort_order, created_at)
// We will select first image by lowest sort_order (if any)
$sql = "
    SELECT 
        p.id,
        p.title,
        p.price,
        pi.url AS image_url
    FROM products p
    LEFT JOIN (
        SELECT product_id, MIN(sort_order) AS min_sort
        FROM product_images
        GROUP BY product_id
    ) pim ON pim.product_id = p.id
    LEFT JOIN product_images pi 
        ON pi.product_id = pim.product_id AND pi.sort_order = pim.min_sort
    WHERE p.status IS NULL OR p.status = 'active'
    ORDER BY p.id DESC
";

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
        'title' => $row['title'] ?? '',
        'price' => isset($row['price']) && is_numeric($row['price']) ? (0 + $row['price']) : $row['price'],
        'image_url' => $row['image_url'] ?? null,
    ];
}

echo json_encode($rows);
