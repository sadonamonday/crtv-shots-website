<?php
require_once __DIR__ . '/../../../utils/bootstrap.php';
require_once __DIR__ . '/../../../config/database.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    json_error('Method Not Allowed', 405);
}

// Admin guard
$isAdmin = !empty($_SESSION['is_admin']);
if (!$isAdmin) {
    json_error('Forbidden', 403);
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if (!$id) {
    json_error('Missing id', 400);
}

$stmt = $con->prepare('DELETE FROM gallery_items WHERE id = ?');
$stmt->bind_param('i', $id);
if (!$stmt->execute()) {
    json_error('Failed to delete item', 500);
}
json_ok(['id' => $id]);
