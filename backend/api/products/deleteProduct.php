<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
    $input = json_decode(file_get_contents('php://input'), true);
    if (is_array($input) && isset($input['id'])) { $id = (int)$input['id']; }
}

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'id is required']);
    exit;
}

// Archive product instead of hard deleting
$sql = "UPDATE products SET status='inactive', updated_at=NOW() WHERE id=$id";
if (!mysqli_query($con, $sql)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to archive product', 'details' => mysqli_error($con)]);
    exit;
}

echo json_encode(['success' => true, 'id' => $id, 'archived' => true]);
