<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: PUT, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
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
$stock = isset($input['stock']) ? (int)$input['stock'] : null; // absolute value

if ($id <= 0 || $stock === null) {
    http_response_code(400);
    echo json_encode(['error' => 'id and stock are required']);
    exit;
}

$sql = "UPDATE products SET stock=$stock, updated_at=NOW() WHERE id=$id";
if (!mysqli_query($con, $sql)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update stock', 'details' => mysqli_error($con)]);
    exit;
}

$res = mysqli_query($con, "SELECT id, stock FROM products WHERE id=$id");
$row = $res ? mysqli_fetch_assoc($res) : null;
if ($row) {
    $row['id'] = (int)$row['id'];
    $row['stock'] = isset($row['stock']) ? (int)$row['stock'] : null;
}

echo json_encode($row ?: ['id'=>$id,'stock'=>$stock]);
