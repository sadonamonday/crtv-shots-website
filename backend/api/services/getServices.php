<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
// JSON API for services list
// Method: GET -> returns array of { id, title, base_price, duration_minutes, status }

require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method Not Allowed', 405);
}

// Ensure services table exists with required columns
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

// Filters: status and search by title (q)
$status = isset($_GET['status']) ? trim($_GET['status']) : null;
$q = isset($_GET['q']) ? trim($_GET['q']) : '';

$wheres = [];
$params = [];
$types = '';

if ($status !== null && $status !== '') { $wheres[] = 'status = ?'; $params[] = $status; $types .= 's'; }
if ($q !== '') { $wheres[] = 'title LIKE ?'; $params[] = '%' . $q . '%'; $types .= 's'; }

$sql = 'SELECT id, title, base_price, duration_minutes, status FROM services';
if (!empty($wheres)) { $sql .= ' WHERE ' . implode(' AND ', $wheres); }
$sql .= ' ORDER BY id DESC';

if (!empty($params)) {
    $stmt = mysqli_prepare($con, $sql);
    if (!$stmt) { json_error('Failed to prepare query', 500); }
    mysqli_stmt_bind_param($stmt, $types, ...$params);
    if (!mysqli_stmt_execute($stmt)) { json_error('Failed to query services', 500); }
    $result = mysqli_stmt_get_result($stmt);
} else {
    $result = mysqli_query($con, $sql);
    if ($result === false) { json_error('Failed to query services', 500); }
}

$rows = [];
while ($row = mysqli_fetch_assoc($result)) {
    $rows[] = [
        'id' => (int)$row['id'],
        'title' => $row['title'] ?? '',
        'base_price' => isset($row['base_price']) && is_numeric($row['base_price']) ? 0 + $row['base_price'] : null,
        'duration_minutes' => isset($row['duration_minutes']) ? (int)$row['duration_minutes'] : null,
        'status' => $row['status'] ?? null,
    ];
}

json_ok($rows);
