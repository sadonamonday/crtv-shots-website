<?php
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed', 405);
}

// Ensure table exists (safe no-op if present)
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

function map_order_row($row) {
    return [
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
        // snake_case duplicates for admin export needs
        'customer_name' => $row['customer_name'] ?? null,
        'customer_email' => $row['customer_email'] ?? null,
        'created_at' => $row['created_at'] ?? null,
        'updated_at' => $row['updated_at'] ?? null,
    ];
}

// Filters
$userId = isset($_GET['userId']) ? (int)$_GET['userId'] : null;
$status = isset($_GET['status']) ? trim($_GET['status']) : null;
$q = isset($_GET['q']) ? trim($_GET['q']) : null; // search by customer name or email
$limit = isset($_GET['limit']) ? max(1, min(200, (int)$_GET['limit'])) : 100;
$offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;

$sql = "SELECT * FROM orders";
$where = [];
$params = [];
$types = '';

if ($userId) { $where[] = 'user_id = ?'; $types .= 'i'; $params[] = $userId; }
if ($status) { $where[] = 'status = ?'; $types .= 's'; $params[] = $status; }
if ($q !== null && $q !== '') { $where[] = '(customer_name LIKE ? OR customer_email LIKE ?)'; $types .= 'ss'; $like = '%' . $q . '%'; $params[] = $like; $params[] = $like; }

if ($where) { $sql .= ' WHERE ' . implode(' AND ', $where); }
$sql .= ' ORDER BY id DESC LIMIT ? OFFSET ?';
$types .= 'ii';
$params[] = $limit; $params[] = $offset;

$stmt = mysqli_prepare($con, $sql);
if (!$stmt) json_error('Failed to prepare statement');

mysqli_stmt_bind_param($stmt, $types, ...$params);
if (!mysqli_stmt_execute($stmt)) json_error('Failed to fetch orders');
$result = mysqli_stmt_get_result($stmt);

$orders = [];
while ($row = mysqli_fetch_assoc($result)) {
    $orders[] = map_order_row($row);
}

json_ok([ 'items' => $orders, 'count' => count($orders) ]);
