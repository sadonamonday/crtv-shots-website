<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: PUT, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'PATCH') { http_response_code(405); echo json_encode(['error'=>'Method Not Allowed']); exit; }

require_once __DIR__ . '/../../config/database.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) { $input = []; }

$id = isset($input['id']) ? (int)$input['id'] : (isset($_GET['id']) ? (int)$_GET['id'] : 0);
if ($id <= 0) { http_response_code(400); echo json_encode(['error'=>'id is required']); exit; }

$fields = [];
if (array_key_exists('url', $input)) { $url_esc = mysqli_real_escape_string($con, (string)$input['url']); $fields[] = "url='$url_esc'"; }
if (array_key_exists('alt', $input)) { $alt_esc = mysqli_real_escape_string($con, (string)$input['alt']); $fields[] = "alt='$alt_esc'"; }
if (array_key_exists('sort_order', $input)) { $fields[] = 'sort_order='.(int)$input['sort_order']; }

if (empty($fields)) { http_response_code(400); echo json_encode(['error'=>'No fields to update']); exit; }

$sql = "UPDATE product_images SET ".implode(', ',$fields)." WHERE id=$id";
if (!mysqli_query($con, $sql)) { http_response_code(500); echo json_encode(['error'=>'Failed to update image','details'=>mysqli_error($con)]); exit; }

$res = mysqli_query($con, "SELECT id, product_id, url, alt, sort_order FROM product_images WHERE id=$id");
$row = $res ? mysqli_fetch_assoc($res) : null;
if ($row) {
  $row['id'] = (int)$row['id'];
  $row['product_id'] = (int)$row['product_id'];
  $row['sort_order'] = isset($row['sort_order']) ? (int)$row['sort_order'] : null;
}

echo json_encode($row ?: ['id'=>$id]);
