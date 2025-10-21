<?php
// JSON API to create a service
// Method: POST -> body JSON { title, description?, price?, status?, type? }

require_once __DIR__ . '/../utils/cors.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([ 'error' => 'Method Not Allowed' ]);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

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

$raw = file_get_contents('php://input');
$body = json_decode($raw, true);
if (!is_array($body)) $body = [];

$title = trim($body['title'] ?? '');
$description = $body['description'] ?? null;
$price = $body['price'] ?? null;
$status = $body['status'] ?? null;
$type = $body['type'] ?? 'service';

if ($title === '') {
    http_response_code(400);
    echo json_encode([ 'error' => 'Title is required' ]);
    exit;
}

// Normalize price
if ($price !== null && $price !== '') {
    if (!is_numeric($price)) {
        http_response_code(400);
        echo json_encode([ 'error' => 'Price must be numeric' ]);
        exit;
    }
    $price = (0 + $price);
} else {
    $price = null;
}

$stmt = mysqli_prepare($con, "INSERT INTO services (title, description, price, status, type) VALUES (?, ?, ?, ?, ?)");
if (!$stmt) {
    http_response_code(500);
    echo json_encode([ 'error' => 'Failed to prepare statement' ]);
    exit;
}
mysqli_stmt_bind_param($stmt, 'ssdss', $title, $description, $price, $status, $type);
$ok = mysqli_stmt_execute($stmt);
if (!$ok) {
    http_response_code(500);
    echo json_encode([ 'error' => 'Failed to create service' ]);
    exit;
}
$id = mysqli_insert_id($con);

echo json_encode([
    'id' => (int)$id,
    'title' => $title,
    'description' => $description,
    'price' => $price,
    'status' => $status,
    'type' => $type,
]);
