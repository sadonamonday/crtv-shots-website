<?php
// Products list API with filtering and search
// Method: GET -> returns array of { id, title, price, stock, status, category_id, image_url }

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
    echo json_encode([ 'error' => 'Method Not Allowed' ]);
    exit;
}

require_once __DIR__ . '/../config/database.php';

if (!isset($con) || $con === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Params: status=active|inactive|all, category_id, q (search in title or slug)
$status = isset($_GET['status']) ? trim($_GET['status']) : 'active';
$category_id = isset($_GET['category_id']) ? (int)$_GET['category_id'] : 0;
$q = isset($_GET['q']) ? trim($_GET['q']) : '';

$where = [];
if ($status !== 'all') {
    if ($status === 'inactive') {
        $where[] = "p.status = 'inactive'";
    } else {
        // default active (also allow NULL treated as active)
        $where[] = "(p.status IS NULL OR p.status = 'active')";
    }
}
if ($category_id > 0) {
    $where[] = 'p.category_id='.(int)$category_id;
}
if ($q !== '') {
    $q_esc = mysqli_real_escape_string($con, $q);
    $where[] = "(p.title LIKE '%$q_esc%' OR p.slug LIKE '%$q_esc%')";
}
$whereSql = empty($where) ? '' : ('WHERE ' . implode(' AND ', $where));

$sql = "
    SELECT 
        p.id,
        p.title,
        p.price,
        p.stock,
        p.status,
        p.category_id,
        pi.url AS image_url
    FROM products p
    LEFT JOIN (
        SELECT product_id, MIN(sort_order) AS min_sort
        FROM product_images
        GROUP BY product_id
    ) pim ON pim.product_id = p.id
    LEFT JOIN product_images pi 
        ON pi.product_id = pim.product_id AND pi.sort_order = pim.min_sort
    $whereSql
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
        'stock' => isset($row['stock']) ? (int)$row['stock'] : null,
        'status' => $row['status'] ?? null,
        'category_id' => isset($row['category_id']) ? (int)$row['category_id'] : null,
        'image_url' => $row['image_url'] ?? null,
    ];
}

echo json_encode($rows);
