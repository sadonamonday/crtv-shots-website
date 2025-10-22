<?php
// JSON API to create a service
// Method: POST -> body JSON { title, description?, base_price?, duration_minutes?, slug?, status? }

require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

$title = trim($body['title'] ?? '');
$description = $body['description'] ?? null;
$base_price = $body['base_price'] ?? null;
$duration_minutes = isset($body['duration_minutes']) ? $body['duration_minutes'] : null;
$slug = isset($body['slug']) ? trim((string)$body['slug']) : '';
$status = $body['status'] ?? null;

if ($title === '') {
    json_error('Title is required', 400);
}

// Normalize base_price
if ($base_price !== null && $base_price !== '') {
    if (!is_numeric($base_price)) {
        json_error('base_price must be numeric', 400);
    }
    $base_price = 0 + $base_price;
} else {
    $base_price = null;
}

// Normalize duration
if ($duration_minutes !== null && $duration_minutes !== '') {
    if (!is_numeric($duration_minutes)) {
        json_error('duration_minutes must be numeric', 400);
    }
    $duration_minutes = (int)$duration_minutes;
} else {
    $duration_minutes = null;
}

// Generate slug if missing
if ($slug === '') {
    $baseSlug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $title));
    $baseSlug = trim($baseSlug, '-');
} else {
    $baseSlug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $slug));
    $baseSlug = trim($baseSlug, '-');
}

// Ensure unique slug
$finalSlug = $baseSlug !== '' ? $baseSlug : null;
if ($finalSlug !== null && $finalSlug !== '') {
    $check = mysqli_prepare($con, 'SELECT COUNT(*) AS c FROM services WHERE slug = ?');
    mysqli_stmt_bind_param($check, 's', $finalSlug);
    mysqli_stmt_execute($check);
    $res = mysqli_stmt_get_result($check);
    $count = ($row = mysqli_fetch_assoc($res)) ? (int)$row['c'] : 0;
    $suffix = 1;
    while ($count > 0) {
        $try = $baseSlug . '-' . $suffix;
        mysqli_stmt_bind_param($check, 's', $try);
        mysqli_stmt_execute($check);
        $res = mysqli_stmt_get_result($check);
        $count = ($row = mysqli_fetch_assoc($res)) ? (int)$row['c'] : 0;
        if ($count === 0) { $finalSlug = $try; break; }
        $suffix++;
    }
}

$stmt = mysqli_prepare($con, "INSERT INTO services (title, slug, description, base_price, duration_minutes, status) VALUES (?, ?, ?, ?, ?, ?)");
if (!$stmt) {
    json_error('Failed to prepare statement', 500);
}
mysqli_stmt_bind_param($stmt, 'sssdis', $title, $finalSlug, $description, $base_price, $duration_minutes, $status);
$ok = mysqli_stmt_execute($stmt);
if (!$ok) {
    json_error('Failed to create service', 500);
}
$id = mysqli_insert_id($con);

json_ok([
    'id' => (int)$id,
    'title' => $title,
    'slug' => $finalSlug,
    'description' => $description,
    'base_price' => $base_price,
    'duration_minutes' => $duration_minutes,
    'status' => $status,
], 201);
