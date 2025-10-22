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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

require_once __DIR__ . '/../config/database.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) { $input = $_POST; }

$title = trim($input['title'] ?? '');
$price = $input['price'] ?? null;
$description = trim($input['description'] ?? '');
$slug = trim($input['slug'] ?? '');
$currency = $input['currency'] ?? 'ZAR';
$status = $input['status'] ?? 'active';
$type = $input['type'] ?? 'product';
$stock = isset($input['stock']) ? (int)$input['stock'] : 0;
$category_id = isset($input['category_id']) ? (int)$input['category_id'] : null;
$image_url = trim($input['image_url'] ?? ''); // optional, to create first image row

$errors = [];
if ($title === '') { $errors[] = 'title is required'; }
if ($price === null || !is_numeric($price)) { $errors[] = 'price must be a number'; }
if ($slug === '') { $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $title)); $slug = trim($slug, '-'); }

if ($errors) {
    http_response_code(400);
    echo json_encode(['error' => 'Validation failed', 'details' => $errors]);
    exit;
}

$title_esc = mysqli_real_escape_string($con, $title);
$slug_esc = mysqli_real_escape_string($con, $slug);
$desc_esc = mysqli_real_escape_string($con, $description);
$currency_esc = mysqli_real_escape_string($con, $currency);
$status_esc = mysqli_real_escape_string($con, $status);
$type_esc = mysqli_real_escape_string($con, $type);
$category_sql = $category_id !== null ? (int)$category_id : 'NULL';
$stock_int = (int)$stock;
$price_num = (0 + $price);

$sql = "INSERT INTO products (category_id, title, slug, description, price, currency, status, type, stock, created_at, updated_at)
        VALUES ($category_sql, '$title_esc', '$slug_esc', '$desc_esc', $price_num, '$currency_esc', '$status_esc', '$type_esc', $stock_int, NOW(), NOW())";

if (!mysqli_query($con, $sql)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create product', 'details' => mysqli_error($con)]);
    exit;
}

$product_id = (int)mysqli_insert_id($con);

if ($image_url !== '') {
    $img_url_esc = mysqli_real_escape_string($con, $image_url);
    mysqli_query($con, "INSERT INTO product_images (product_id, url, alt, sort_order, created_at) VALUES ($product_id, '$img_url_esc', '$title_esc', 1, NOW())");
}

// Return created product (basic fields)
$res = mysqli_query($con, "SELECT p.id, p.title, p.price, (SELECT url FROM product_images WHERE product_id=p.id ORDER BY sort_order ASC LIMIT 1) AS image_url FROM products p WHERE p.id=$product_id");
$row = $res ? mysqli_fetch_assoc($res) : null;
if (!$row) {
    $row = ['id' => $product_id, 'title' => $title, 'price' => $price_num, 'image_url' => $image_url ?: null];
}

echo json_encode($row);
