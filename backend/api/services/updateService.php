<?php
// JSON API to update a service
// Method: PUT -> body JSON { id, title?, description?, base_price?, duration_minutes?, slug?, status? }

require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    json_error('Method Not Allowed', 405);
}

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

$body = json_input();

$id = isset($body['id']) ? (int)$body['id'] : 0;
if ($id <= 0) {
    json_error('Valid id is required', 400);
}

$title = isset($body['title']) ? trim($body['title']) : null;
$description = $body['description'] ?? null;
$base_price = $body['base_price'] ?? null;
$duration_minutes = $body['duration_minutes'] ?? null;
$slug = isset($body['slug']) ? trim((string)$body['slug']) : null;
$status = $body['status'] ?? null;

$fields = [];
$params = [];
$types = '';

if ($title !== null) { $fields[] = 'title = ?'; $params[] = $title; $types .= 's'; }
if ($description !== null) { $fields[] = 'description = ?'; $params[] = $description; $types .= 's'; }
if ($base_price !== null) {
    if ($base_price === '' || !is_numeric($base_price)) { json_error('base_price must be numeric', 400); }
    $fields[] = 'base_price = ?'; $params[] = (0 + $base_price); $types .= 'd';
}
if ($duration_minutes !== null) {
    if ($duration_minutes === '' || !is_numeric($duration_minutes)) { json_error('duration_minutes must be numeric', 400); }
    $fields[] = 'duration_minutes = ?'; $params[] = (int)$duration_minutes; $types .= 'i';
}
if ($slug !== null) {
    $newSlug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $slug));
    $newSlug = trim($newSlug, '-');
    if ($newSlug === '') { $newSlug = null; }
    if ($newSlug !== null) {
        // Ensure unique (excluding this id)
        $check = mysqli_prepare($con, 'SELECT COUNT(*) AS c FROM services WHERE slug = ? AND id <> ?');
        mysqli_stmt_bind_param($check, 'si', $newSlug, $id);
        mysqli_stmt_execute($check);
        $res = mysqli_stmt_get_result($check);
        $count = ($row = mysqli_fetch_assoc($res)) ? (int)$row['c'] : 0;
        $suffix = 1;
        $baseSlug = $newSlug;
        while ($count > 0) {
            $try = $baseSlug . '-' . $suffix;
            mysqli_stmt_bind_param($check, 'si', $try, $id);
            mysqli_stmt_execute($check);
            $res = mysqli_stmt_get_result($check);
            $count = ($row = mysqli_fetch_assoc($res)) ? (int)$row['c'] : 0;
            if ($count === 0) { $newSlug = $try; break; }
            $suffix++;
        }
    }
    $fields[] = 'slug = ?'; $params[] = $newSlug; $types .= 's';
}
if ($status !== null) { $fields[] = 'status = ?'; $params[] = $status; $types .= 's'; }

if (empty($fields)) {
    json_error('No fields to update', 400);
}

$sql = 'UPDATE services SET ' . implode(', ', $fields) . ' WHERE id = ?';
$params[] = $id; $types .= 'i';

$stmt = mysqli_prepare($con, $sql);
if (!$stmt) {
    json_error('Failed to prepare statement', 500);
}

mysqli_stmt_bind_param($stmt, $types, ...$params);
$ok = mysqli_stmt_execute($stmt);
if (!$ok) {
    json_error('Failed to update service', 500);
}

json_ok([ 'id' => $id, 'updated' => true ]);
