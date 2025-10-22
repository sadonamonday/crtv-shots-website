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

// Attach user details if available
if (!empty($order['userId'])) {
    // best-effort users table read
    $usersTblExists = mysqli_query($con, "SHOW TABLES LIKE 'users'");
    if ($usersTblExists && mysqli_num_rows($usersTblExists) > 0) {
        $uStmt = mysqli_prepare($con, 'SELECT id, name, email FROM users WHERE id = ?');
        if ($uStmt) {
            mysqli_stmt_bind_param($uStmt, 'i', $order['userId']);
            if (mysqli_stmt_execute($uStmt)) {
                $uRes = mysqli_stmt_get_result($uStmt);
                $uRow = mysqli_fetch_assoc($uRes);
                if ($uRow) {
                    $order['user'] = [
                        'id' => (int)$uRow['id'],
                        'name' => $uRow['name'] ?? null,
                        'email' => $uRow['email'] ?? null,
                    ];
                }
            }
        }
    }
}

// Ensure and fetch payments linked to this order
mysqli_query($con, "CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  provider VARCHAR(64) NULL,
  provider_txn_id VARCHAR(128) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$pStmt = mysqli_prepare($con, 'SELECT id, amount, provider, provider_txn_id, status, created_at FROM payments WHERE order_id = ? ORDER BY id DESC');
if ($pStmt) {
    mysqli_stmt_bind_param($pStmt, 'i', $id);
    if (mysqli_stmt_execute($pStmt)) {
        $pRes = mysqli_stmt_get_result($pStmt);
        $payments = [];
        while ($pRow = mysqli_fetch_assoc($pRes)) {
            $payments[] = [
                'id' => (int)$pRow['id'],
                'amount' => (float)$pRow['amount'],
                'provider' => $pRow['provider'] ?? null,
                'providerTxnId' => $pRow['provider_txn_id'] ?? null,
                'status' => $pRow['status'] ?? null,
                'createdAt' => $pRow['created_at'] ?? null,
            ];
        }
        $order['payments'] = $payments;
    }
}

json_ok($order);
