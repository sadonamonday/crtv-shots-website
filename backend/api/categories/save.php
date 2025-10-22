<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

$data = json_input();
$id = isset($data['id']) ? (int)$data['id'] : 0;
$name = isset($data['name']) ? trim($data['name']) : '';
$slug = isset($data['slug']) ? trim($data['slug']) : '';
$description = isset($data['description']) ? trim((string)$data['description']) : null;

if ($name === '') { json_error('name is required', 422); }
if ($slug === '') {
    // auto-generate slug from name
    $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $name));
    $slug = trim($slug, '-');
}

// Ensure categories table exists
mysqli_query($con, "CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

if ($id > 0) {
    // Update
    $stmt = mysqli_prepare($con, 'UPDATE categories SET name=?, slug=?, description=? WHERE id=?');
    if (!$stmt) { json_error('Failed to prepare update', 500); }
    mysqli_stmt_bind_param($stmt, 'sssi', $name, $slug, $description, $id);
    if (!mysqli_stmt_execute($stmt)) { json_error('Failed to update category', 500); }
    json_ok(['id' => $id, 'name' => $name, 'slug' => $slug, 'description' => $description]);
} else {
    // Insert; ensure slug unique (append number if needed)
    $base = $slug;
    $i = 1;
    while (true) {
        $chk = mysqli_prepare($con, 'SELECT id FROM categories WHERE slug=? LIMIT 1');
        if ($chk) {
            mysqli_stmt_bind_param($chk, 's', $slug);
            mysqli_stmt_execute($chk);
            $r = mysqli_stmt_get_result($chk);
            if ($r && mysqli_fetch_assoc($r)) {
                $slug = $base . '-' . (++$i);
                continue;
            }
        }
        break;
    }
    $stmt = mysqli_prepare($con, 'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)');
    if (!$stmt) { json_error('Failed to prepare insert', 500); }
    mysqli_stmt_bind_param($stmt, 'sss', $name, $slug, $description);
    if (!mysqli_stmt_execute($stmt)) { json_error('Failed to create category', 500); }
    $newId = (int)mysqli_insert_id($con);
    json_ok(['id' => $newId, 'name' => $name, 'slug' => $slug, 'description' => $description], 201);
}
