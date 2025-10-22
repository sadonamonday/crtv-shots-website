<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error'=>'Method Not Allowed']); exit; }

require_once __DIR__ . '/../../config/database.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) { $input = $_POST; }

$product_id = isset($input['product_id']) ? (int)$input['product_id'] : 0;
$url = trim($input['url'] ?? '');
$alt = trim($input['alt'] ?? '');
switch (true) {
  case $product_id <= 0: http_response_code(400); echo json_encode(['error'=>'product_id is required']); exit;
  case $url === '': http_response_code(400); echo json_encode(['error'=>'url is required']); exit;
}
$sort_order = isset($input['sort_order']) ? (int)$input['sort_order'] : null;
if ($sort_order === null) {
  // find next sort_order
  $res = mysqli_query($con, "SELECT COALESCE(MAX(sort_order),0)+1 AS next_sort FROM product_images WHERE product_id=$product_id");
  $row = $res ? mysqli_fetch_assoc($res) : null;
  $sort_order = (int)($row['next_sort'] ?? 1);
}

$url_esc = mysqli_real_escape_string($con, $url);
$alt_esc = mysqli_real_escape_string($con, $alt);

$sql = "INSERT INTO product_images (product_id, url, alt, sort_order, created_at) VALUES ($product_id, '$url_esc', '$alt_esc', $sort_order, NOW())";
if (!mysqli_query($con, $sql)) { http_response_code(500); echo json_encode(['error'=>'Failed to add image','details'=>mysqli_error($con)]); exit; }

$id = (int)mysqli_insert_id($con);

echo json_encode(['id'=>$id,'product_id'=>$product_id,'url'=>$url,'alt'=>$alt,'sort_order'=>$sort_order]);
