<?php
require_once __DIR__ . '/../../utils/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';

if (!in_array($_SERVER['REQUEST_METHOD'], ['DELETE', 'POST'], true)) {
    json_error('Method Not Allowed', 405);
}

// Admin guard
$isAdmin = !empty($_SESSION['is_admin']);
if (!$isAdmin) {
    json_error('Forbidden', 403);
}

// Accept id from query, form, or JSON
$id = null;
if (isset($_GET['id'])) $id = (int)$_GET['id'];
if (!$id && isset($_POST['id'])) $id = (int)$_POST['id'];
if (!$id) {
    $data = json_input();
    if (isset($data['id'])) $id = (int)$data['id'];
}
if (!$id) {
    json_error('Missing id', 400);
}

// Find record
$stmt = $con->prepare('SELECT filename FROM gallery_photos WHERE id = ?');
$stmt->bind_param('i', $id);
if (!$stmt->execute()) {
    json_error('Failed to query', 500);
}
$res = $stmt->get_result();
$row = $res->fetch_assoc();
if (!$row) {
    json_error('Not found', 404);
}
$filename = $row['filename'];

// Delete DB row
$stmt = $con->prepare('DELETE FROM gallery_photos WHERE id = ?');
$stmt->bind_param('i', $id);
if (!$stmt->execute()) {
    json_error('Failed to delete', 500);
}

// Delete file
$uploadDir = realpath(__DIR__ . '/../../..') . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'Gallery' . DIRECTORY_SEPARATOR . 'uploads';
$path = $uploadDir . DIRECTORY_SEPARATOR . $filename;
if (is_file($path)) {
    @unlink($path);
}

json_ok(['deleted' => $id]);
