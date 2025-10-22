<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] !== 'GET') { http_response_code(405); echo json_encode(['error'=>'Method Not Allowed']); exit; }

require_once __DIR__ . '/../config/database.php';

$product_id = isset($_GET['product_id']) ? (int)$_GET['product_id'] : 0;
if ($product_id <= 0) { http_response_code(400); echo json_encode(['error'=>'product_id is required']); exit; }

$rows = [];
$res = mysqli_query($con, "SELECT id, url, alt, sort_order FROM product_images WHERE product_id=$product_id ORDER BY sort_order ASC, id ASC");
if ($res) {
  while ($row = mysqli_fetch_assoc($res)) {
    $rows[] = [
      'id' => (int)$row['id'],
      'url' => $row['url'] ?? null,
      'alt' => $row['alt'] ?? '',
      'sort_order' => isset($row['sort_order']) ? (int)$row['sort_order'] : null,
    ];
  }
}

echo json_encode($rows);
