<?php
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

$body = json_input();

$customer_name = trim($body['customerName'] ?? ($body['name'] ?? ''));
$customer_email = trim($body['customerEmail'] ?? ($body['email'] ?? ''));
$customer_phone = trim($body['customerPhone'] ?? ($body['phone'] ?? ''));
$user_id = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : (isset($body['userId']) ? (int)$body['userId'] : null);
$items = $body['items'] ?? [];
$total = (float)($body['total'] ?? 0);
$status = trim($body['status'] ?? 'pending');
$notes = trim($body['notes'] ?? '');

if ($total < 0) {
    json_error('Total must be non-negative');
}

// Minimal validation
if ($customer_name === '' && !$user_id) {
    json_error('Missing required fields: customerName or userId');
}

// Ensure table exists (idempotent)
mysqli_query($con, "CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  customer_name VARCHAR(255) NULL,
  customer_email VARCHAR(255) NULL,
  customer_phone VARCHAR(64) NULL,
  items_json JSON NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$items_json = json_encode($items, JSON_UNESCAPED_UNICODE);

$stmt = mysqli_prepare($con, "INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, items_json, total, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
if (!$stmt) json_error('Failed to prepare statement');

// i s s s s d s s
mysqli_stmt_bind_param($stmt, 'isssssds', $user_id, $customer_name, $customer_email, $customer_phone, $items_json, $total, $status, $notes);

if (!mysqli_stmt_execute($stmt)) {
    json_error('Failed to create order');
}
$id = mysqli_insert_id($con);

$order = [
    'id' => (int)$id,
    'userId' => $user_id,
    'customerName' => $customer_name,
    'customerEmail' => $customer_email,
    'customerPhone' => $customer_phone,
    'items' => $items,
    'total' => (float)$total,
    'status' => $status,
    'notes' => $notes,
    'createdAt' => date('c')
];

json_ok($order, 201);
