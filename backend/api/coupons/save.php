<?php
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    json_error('Method not allowed', 405);
}

$body = json_input();

// Ensure coupons table exists
mysqli_query($con, "CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(64) NOT NULL UNIQUE,
  type VARCHAR(32) NOT NULL,
  value DECIMAL(10,2) NOT NULL DEFAULT 0,
  description TEXT NULL,
  starts_at DATETIME NULL,
  expires_at DATETIME NULL,
  max_uses INT NULL,
  used_count INT NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$id = isset($body['id']) ? (int)$body['id'] : 0;
$code = trim($body['code'] ?? '');
$type = trim($body['type'] ?? '');
$value = isset($body['value']) ? (float)$body['value'] : 0;
$description = trim($body['description'] ?? '');
$starts_at = trim($body['startsAt'] ?? '');
$expires_at = trim($body['expiresAt'] ?? '');
$max_uses = isset($body['maxUses']) && $body['maxUses'] !== '' ? (int)$body['maxUses'] : null;
$active = isset($body['active']) ? (int)!!$body['active'] : 1;

if ($code === '' || $type === '') {
    json_error('Missing required fields: code, type');
}

if ($id > 0) {
    // Update existing
    $fields = ['code = ?', 'type = ?', 'value = ?', 'description = ?', 'active = ?'];
    $params = [$code, $type, $value, $description, $active];
    $types = 'ssdsi';
    if ($starts_at !== '') { $fields[] = 'starts_at = ?'; $params[] = $starts_at; $types .= 's'; }
    if ($expires_at !== '') { $fields[] = 'expires_at = ?'; $params[] = $expires_at; $types .= 's'; }
    if ($max_uses !== null) { $fields[] = 'max_uses = ?'; $params[] = $max_uses; $types .= 'i'; }

    $sql = 'UPDATE coupons SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $params[] = $id; $types .= 'i';
    $stmt = mysqli_prepare($con, $sql);
    if (!$stmt) json_error('Failed to prepare');
    mysqli_stmt_bind_param($stmt, $types, ...$params);
    if (!mysqli_stmt_execute($stmt)) json_error('Failed to update coupon');
    json_ok(['id' => $id]);
} else {
    // Insert
    $sql = 'INSERT INTO coupons (code, type, value, description, starts_at, expires_at, max_uses, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    $stmt = mysqli_prepare($con, $sql);
    if (!$stmt) json_error('Failed to prepare');
    // allow nulls for dates/max_uses
    $startsParam = $starts_at !== '' ? $starts_at : null;
    $expiresParam = $expires_at !== '' ? $expires_at : null;
    // bind
    mysqli_stmt_bind_param($stmt, 'ssdsssii', $code, $type, $value, $description, $startsParam, $expiresParam, $max_uses, $active);
    if (!mysqli_stmt_execute($stmt)) {
        json_error('Failed to create coupon');
    }
    $newId = mysqli_insert_id($con);
    json_ok(['id' => $newId], 201);
}
