<?php
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed', 405);
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) json_error('Missing id');

$stmt = mysqli_prepare($con, 'SELECT * FROM orders WHERE id = ?');
if (!$stmt) json_error('Failed to prepare statement');
mysqli_stmt_bind_param($stmt, 'i', $id);
if (!mysqli_stmt_execute($stmt)) json_error('Failed to fetch order');
$res = mysqli_stmt_get_result($stmt);
$row = mysqli_fetch_assoc($res);
if (!$row) json_error('Not found', 404);

$order = [
    'id' => (int)$row['id'],
    'userId' => isset($row['user_id']) ? (int)$row['user_id'] : null,
    'customerName' => $row['customer_name'] ?? null,
    'customerEmail' => $row['customer_email'] ?? null,
    'customerPhone' => $row['customer_phone'] ?? null,
    'items' => $row['items_json'] ? json_decode($row['items_json'], true) : [],
    'total' => (float)($row['total'] ?? 0),
    'status' => $row['status'] ?? 'pending',
    'notes' => $row['notes'] ?? null,
    'createdAt' => $row['created_at'] ?? null,
    'updatedAt' => $row['updated_at'] ?? null,
];

json_ok($order);
