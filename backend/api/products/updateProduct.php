<?php
require_once __DIR__ . '/../utils/cors.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) { $input = []; }

$id = isset($input['id']) ? (int)$input['id'] : (isset($_GET['id']) ? (int)$_GET['id'] : 0);
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'id is required']);
    exit;
}

$fields = [];
$map = [
    'title' => 'string',
    'slug' => 'string',
    'description' => 'string',
    'price' => 'number',
    'currency' => 'string',
    'status' => 'string',
    'type' => 'string',
    'stock' => 'int',
    'category_id' => 'int'
];

foreach ($map as $key => $type) {
    if (array_key_exists($key, $input)) {
        $val = $input[$key];
        if ($type === 'string') {
            $val = mysqli_real_escape_string($con, (string)$val);
            $fields[] = "$key='$val'";
        } elseif ($type === 'number') {
            if (!is_numeric($val)) continue; // skip invalid
            $num = (0 + $val);
            $fields[] = "$key=$num";
        } elseif ($type === 'int') {
            $fields[] = "$key=" . (int)$val;
        }
    }
}

if (empty($fields)) {
    http_response_code(400);
    echo json_encode(['error' => 'No valid fields provided']);
    exit;
}

$fields[] = "updated_at=NOW()";
$sql = "UPDATE products SET " . implode(', ', $fields) . " WHERE id=$id";

if (!mysqli_query($con, $sql)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update product', 'details' => mysqli_error($con)]);
    exit;
}

$res = mysqli_query($con, "SELECT p.id, p.title, p.price, (SELECT url FROM product_images WHERE product_id=p.id ORDER BY sort_order ASC LIMIT 1) AS image_url FROM products p WHERE p.id=$id");
$row = $res ? mysqli_fetch_assoc($res) : null;
if (!$row) { $row = ['id' => $id]; }

echo json_encode($row);
