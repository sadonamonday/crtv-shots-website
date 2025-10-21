<?php
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

if (!in_array($_SERVER['REQUEST_METHOD'], ['POST','PATCH','PUT'], true)) {
    json_error('Method not allowed', 405);
}

$body = json_input();
$id = isset($body['id']) ? (int)$body['id'] : (isset($_GET['id']) ? (int)$_GET['id'] : 0);
if ($id <= 0) json_error('Missing id');

$fields = [];
$params = [];
$types = '';

if (array_key_exists('customerName', $body)) { $fields[] = 'customer_name = ?'; $types .= 's'; $params[] = trim($body['customerName']); }
if (array_key_exists('customerEmail', $body)) { $fields[] = 'customer_email = ?'; $types .= 's'; $params[] = trim($body['customerEmail']); }
if (array_key_exists('customerPhone', $body)) { $fields[] = 'customer_phone = ?'; $types .= 's'; $params[] = trim($body['customerPhone']); }
if (array_key_exists('userId', $body)) { $fields[] = 'user_id = ?'; $types .= 'i'; $params[] = (int)$body['userId']; }
if (array_key_exists('items', $body)) { $fields[] = 'items_json = ?'; $types .= 's'; $params[] = json_encode($body['items'] ?? [], JSON_UNESCAPED_UNICODE); }
if (array_key_exists('total', $body)) { $fields[] = 'total = ?'; $types .= 'd'; $params[] = (float)$body['total']; }
if (array_key_exists('status', $body)) { $fields[] = 'status = ?'; $types .= 's'; $params[] = trim($body['status']); }
if (array_key_exists('notes', $body)) { $fields[] = 'notes = ?'; $types .= 's'; $params[] = trim($body['notes']); }

if (!$fields) json_error('No fields to update');

$sql = 'UPDATE orders SET ' . implode(', ', $fields) . ' WHERE id = ?';
$types .= 'i';
$params[] = $id;

$stmt = mysqli_prepare($con, $sql);
if (!$stmt) json_error('Failed to prepare statement');

mysqli_stmt_bind_param($stmt, $types, ...$params);
if (!mysqli_stmt_execute($stmt)) json_error('Failed to update order');

require __DIR__ . '/getOrder.php';
