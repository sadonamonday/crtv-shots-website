<?php
// JSON API to delete a service
// Method: DELETE -> query ?id=123

require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    json_error('Method Not Allowed', 405);
}

// Ensure table exists just in case
$createSql = "
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NULL UNIQUE,
  description TEXT NULL,
  base_price DECIMAL(10,2) NULL,
  duration_minutes INT NULL,
  status VARCHAR(20) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";
mysqli_query($con, $createSql);

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
    json_error('Valid id is required', 400);
}

$stmt = mysqli_prepare($con, 'DELETE FROM services WHERE id = ?');
if (!$stmt) {
    json_error('Failed to prepare statement', 500);
}
mysqli_stmt_bind_param($stmt, 'i', $id);
$ok = mysqli_stmt_execute($stmt);
if (!$ok) {
    json_error('Failed to delete service', 500);
}

json_ok([ 'id' => $id, 'deleted' => true ]);
