<?php
// JSON API for services list
// Method: GET -> returns array of { id, title, price, status }

require_once __DIR__ . '/../utils/cors.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([ 'error' => 'Method Not Allowed' ]);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

// Ensure services table exists (lightweight guard similar to bookings endpoints)
$createSql = "
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  price DECIMAL(10,2) NULL,
  status VARCHAR(20) NULL,
  type VARCHAR(20) DEFAULT 'service',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";
mysqli_query($con, $createSql);

$sql = "
    SELECT id, title, price, status
    FROM services
    WHERE status IS NULL OR status = 'active'
    ORDER BY id DESC
";

$result = mysqli_query($con, $sql);
if ($result === false) {
    http_response_code(500);
    echo json_encode([ 'error' => 'Failed to query services' ]);
    exit;
}

$rows = [];
while ($row = mysqli_fetch_assoc($result)) {
    $rows[] = [
        'id' => isset($row['id']) ? (int)$row['id'] : null,
        'title' => $row['title'] ?? '',
        'price' => isset($row['price']) && is_numeric($row['price']) ? (0 + $row['price']) : $row['price'],
        'status' => $row['status'] ?? null,
    ];
}

echo json_encode($rows);
