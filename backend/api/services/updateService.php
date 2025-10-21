<?php
// JSON API to update a service
// Method: PUT -> body JSON { id, title?, description?, price?, status?, type? }

require_once __DIR__ . '/../utils/cors.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
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

$id = isset($body['id']) ? (int)$body['id'] : 0;
if ($id <= 0) {
    http_response_code(400);
    echo json_encode([ 'error' => 'Valid id is required' ]);
    exit;
}

$title = isset($body['title']) ? trim($body['title']) : null;
$description = $body['description'] ?? null;
$price = $body['price'] ?? null;
$status = $body['status'] ?? null;
$type = $body['type'] ?? null;

$fields = [];
$params = [];
$types = '';

if ($title !== null) { $fields[] = 'title = ?'; $params[] = $title; $types .= 's'; }
if ($description !== null) { $fields[] = 'description = ?'; $params[] = $description; $types .= 's'; }
if ($price !== null) {
    if ($price === '' || !is_numeric($price)) {
        http_response_code(400);
        echo json_encode([ 'error' => 'Price must be numeric' ]);
        exit;
    }
    $fields[] = 'price = ?'; $params[] = (0 + $price); $types .= 'd';
}
if ($status !== null) { $fields[] = 'status = ?'; $params[] = $status; $types .= 's'; }
if ($type !== null) { $fields[] = 'type = ?'; $params[] = $type; $types .= 's'; }

if (empty($fields)) {
    http_response_code(400);
    echo json_encode([ 'error' => 'No fields to update' ]);
    exit;
}

$sql = 'UPDATE services SET ' . implode(', ', $fields) . ' WHERE id = ?';
$params[] = $id; $types .= 'i';

$stmt = mysqli_prepare($con, $sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode([ 'error' => 'Failed to prepare statement' ]);
    exit;
}

mysqli_stmt_bind_param($stmt, $types, ...$params);
$ok = mysqli_stmt_execute($stmt);
if (!$ok) {
    http_response_code(500);
    echo json_encode([ 'error' => 'Failed to update service' ]);
    exit;
}

echo json_encode([ 'id' => $id, 'updated' => true ]);
