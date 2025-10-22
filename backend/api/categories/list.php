<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed', 405);
}

// Ensure categories table exists (safe no-op if already exists)
mysqli_query($con, "CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$includeProducts = isset($_GET['includeProducts']) && ($_GET['includeProducts'] === '1' || strtolower($_GET['includeProducts']) === 'true');

$sql = 'SELECT id, name, slug, description, created_at, updated_at FROM categories ORDER BY name ASC';
$res = mysqli_query($con, $sql);
if ($res === false) {
    json_error('Failed to fetch categories', 500);
}

$out = [];
while ($row = mysqli_fetch_assoc($res)) {
    $cat = [
        'id' => (int)$row['id'],
        'name' => $row['name'],
        'slug' => $row['slug'],
        'description' => $row['description'],
        'created_at' => $row['created_at'] ?? null,
        'updated_at' => $row['updated_at'] ?? null,
    ];

    // Product count
    $countRes = mysqli_query($con, 'SELECT COUNT(*) AS cnt FROM products WHERE category_id=' . (int)$row['id']);
    $cnt = 0;
    if ($countRes && ($cRow = mysqli_fetch_assoc($countRes))) { $cnt = (int)$cRow['cnt']; }
    $cat['product_count'] = $cnt;

    if ($includeProducts) {
        $prods = [];
        $pRes = mysqli_query($con, 'SELECT id, title, slug, price, stock FROM products WHERE category_id=' . (int)$row['id'] . ' ORDER BY id DESC LIMIT 200');
        if ($pRes) {
            while ($p = mysqli_fetch_assoc($pRes)) {
                $prods[] = [
                    'id' => (int)$p['id'],
                    'title' => $p['title'] ?? '',
                    'slug' => $p['slug'] ?? '',
                    'price' => isset($p['price']) ? (0 + $p['price']) : null,
                    'stock' => isset($p['stock']) ? (int)$p['stock'] : null,
                ];
            }
        }
        $cat['products'] = $prods;
    }

    $out[] = $cat;
}

json_ok($out);
