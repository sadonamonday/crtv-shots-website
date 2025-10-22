<?php
require_once __DIR__ . '/../../../utils/bootstrap.php';
require_once __DIR__ . '/../../../config/database.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PATCH'], true)) {
    json_error('Method Not Allowed', 405);
}

// Admin guard
$isAdmin = !empty($_SESSION['is_admin']);
if (!$isAdmin) {
    json_error('Forbidden', 403);
}

// Ensure table exists
mysqli_query($con, "CREATE TABLE IF NOT EXISTS gallery_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  media_id INT DEFAULT NULL,
  title VARCHAR(255) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  sort_order INT DEFAULT 0,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (media_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$payload = $_POST ?: json_input();

$id = isset($payload['id']) ? (int)$payload['id'] : 0;
$title = isset($payload['title']) ? trim((string)$payload['title']) : null;
$description = array_key_exists('description', $payload) ? trim((string)$payload['description']) : null;
$visible = isset($payload['visible']) ? (int)((bool)$payload['visible']) : null;
switch (true) {
    case isset($payload['sort_order']):
        $sort_order = (int)$payload['sort_order'];
        break;
    default:
        $sort_order = null;
}
$media_id = array_key_exists('media_id', $payload) ? ($payload['media_id'] !== null ? (int)$payload['media_id'] : null) : null;

if ($id > 0) {
    // Update
    $fields = [];
    $types = '';
    $params = [];
    if ($title !== null) { $fields[] = 'title = ?'; $types .= 's'; $params[] = $title; }
    if ($description !== null) { $fields[] = 'description = ?'; $types .= 's'; $params[] = $description; }
    if ($visible !== null) { $fields[] = 'visible = ?'; $types .= 'i'; $params[] = $visible; }
    if ($sort_order !== null) { $fields[] = 'sort_order = ?'; $types .= 'i'; $params[] = $sort_order; }
    if ($media_id !== null) { $fields[] = 'media_id = ?'; $types .= 'i'; $params[] = $media_id; }

    if (!$fields) {
        json_error('No fields to update', 400);
    }
    $params[] = $id; $types .= 'i';
    $sql = 'UPDATE gallery_items SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $con->prepare($sql);
    $stmt->bind_param($types, ...$params);
    if (!$stmt->execute()) {
        json_error('Failed to update item', 500);
    }
    json_ok(['id' => $id]);
} else {
    // Create
    if ($title === null) $title = '';
    if ($description === null) $description = '';
    if ($visible === null) $visible = 1;
    if ($sort_order === null) $sort_order = 0;

    $sql = 'INSERT INTO gallery_items (media_id, title, description, sort_order, visible) VALUES (?, ?, ?, ?, ?)';
    $stmt = $con->prepare($sql);
    if ($media_id === null) {
        // bind with null
        $media_id_param = null;
        $stmt->bind_param('issii', $media_id_param, $title, $description, $sort_order, $visible);
    } else {
        $stmt->bind_param('issii', $media_id, $title, $description, $sort_order, $visible);
    }
    if (!$stmt->execute()) {
        json_error('Failed to create item', 500);
    }
    $newId = $stmt->insert_id;
    json_ok(['id' => $newId], 201);
}
