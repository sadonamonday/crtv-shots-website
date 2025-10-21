<?php
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    // Support POST fallback when DELETE not easily available
    if (!($_SERVER['REQUEST_METHOD'] === 'POST' && (isset($_GET['_method']) && strtoupper($_GET['_method']) === 'DELETE'))) {
        json_error('Method not allowed', 405);
    }
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
    // Try body
    $body = json_input();
    $id = isset($body['id']) ? (int)$body['id'] : 0;
}
if ($id <= 0) json_error('Missing id');

$stmt = mysqli_prepare($con, 'DELETE FROM orders WHERE id = ?');
if (!$stmt) json_error('Failed to prepare statement');
mysqli_stmt_bind_param($stmt, 'i', $id);
if (!mysqli_stmt_execute($stmt)) json_error('Failed to delete order');

json_ok(['deleted' => true, 'id' => $id]);
