<?php
// JSON API to delete a service
// Method: DELETE -> query ?id=123

require_once __DIR__ . '/../utils/cors.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode([ 'error' => 'Method Not Allowed' ]);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

// Ensure table exists just in case
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

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
    http_response_code(400);
    echo json_encode([ 'error' => 'Valid id is required' ]);
    exit;
}

$stmt = mysqli_prepare($con, 'DELETE FROM services WHERE id = ?');
if (!$stmt) {
    http_response_code(500);
    echo json_encode([ 'error' => 'Failed to prepare statement' ]);
    exit;
}
mysqli_stmt_bind_param($stmt, 'i', $id);
$ok = mysqli_stmt_execute($stmt);
if (!$ok) {
    http_response_code(500);
    echo json_encode([ 'error' => 'Failed to delete service' ]);
    exit;
}

echo json_encode([ 'id' => $id, 'deleted' => true ]);
