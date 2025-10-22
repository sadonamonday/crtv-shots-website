<?php
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed', 405);
}

// Ensure coupons table exists
mysqli_query($con, "CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(64) NOT NULL UNIQUE,
  type VARCHAR(32) NOT NULL, -- percent or fixed
  value DECIMAL(10,2) NOT NULL DEFAULT 0,
  description TEXT NULL,
  starts_at DATETIME NULL,
  expires_at DATETIME NULL,
  max_uses INT NULL,
  used_count INT NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$active = isset($_GET['active']) ? trim($_GET['active']) : '';
$code = isset($_GET['code']) ? trim($_GET['code']) : '';

$conds = [];
$params = [];
$types = '';
if ($active !== '') { $conds[] = 'active = ?'; $params[] = ($active === '1' || strtolower($active) === 'true') ? 1 : 0; $types .= 'i'; }
if ($code !== '') { $conds[] = 'code = ?'; $params[] = $code; $types .= 's'; }

$sql = 'SELECT id, code, type, value, description, starts_at, expires_at, max_uses, used_count, active, created_at FROM coupons';
if (!empty($conds)) { $sql .= ' WHERE ' . implode(' AND ', $conds); }
$sql .= ' ORDER BY created_at DESC LIMIT 500';

if (!empty($conds)) {
    $stmt = mysqli_prepare($con, $sql);
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, $types, ...$params);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
    } else {
        $res = false;
    }
} else {
    $res = mysqli_query($con, $sql);
}

$out = [];
if ($res) {
    while ($row = mysqli_fetch_assoc($res)) {
        $out[] = [
            'id' => (int)$row['id'],
            'code' => $row['code'],
            'type' => $row['type'],
            'value' => (float)$row['value'],
            'description' => $row['description'],
            'startsAt' => $row['starts_at'],
            'expiresAt' => $row['expires_at'],
            'maxUses' => isset($row['max_uses']) ? (int)$row['max_uses'] : null,
            'usedCount' => (int)$row['used_count'],
            'active' => (int)$row['active'] === 1,
            'createdAt' => $row['created_at'],
        ];
    }
}

json_ok($out);
