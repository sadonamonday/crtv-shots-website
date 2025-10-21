<?php
require_once __DIR__ . '/../utils/cors.php';
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

// Delete related images first (if no ON DELETE CASCADE)
mysqli_query($con, "DELETE FROM product_images WHERE product_id=$id");

if (!mysqli_query($con, "DELETE FROM products WHERE id=$id")) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete product', 'details' => mysqli_error($con)]);
    exit;
}

echo json_encode(['success' => true, 'id' => $id]);
