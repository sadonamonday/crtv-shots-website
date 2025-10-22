<?php
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    json_error('Method not allowed', 405);
}

$body = json_input();
$id = isset($body['id']) ? (int)$body['id'] : 0;
if ($id <= 0) json_error('Missing id');

$active = isset($body['active']) ? (int)!!$body['active'] : null;
if ($active === null) json_error('Missing active');

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

$stmt = mysqli_prepare($con, 'UPDATE coupons SET active = ? WHERE id = ?');
if (!$stmt) json_error('Failed to prepare');
mysqli_stmt_bind_param($stmt, 'ii', $active, $id);
if (!mysqli_stmt_execute($stmt)) json_error('Failed to update');

json_ok(['ok' => true]);
