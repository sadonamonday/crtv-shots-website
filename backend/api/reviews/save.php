<?php
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { json_error('Method not allowed', 405); }

$data = json_input();
$id = isset($data['id']) ? (int)$data['id'] : 0;
$name = isset($data['name']) ? trim($data['name']) : '';
$content = isset($data['content']) ? trim($data['content']) : '';
$rating = isset($data['rating']) ? (int)$data['rating'] : 5;
$photo_url = isset($data['photo_url']) ? trim((string)$data['photo_url']) : null;
$approved = isset($data['approved']) ? (int)((bool)$data['approved']) : null; // optional

if ($name === '') { json_error('name is required', 422); }
if ($content === '') { json_error('content is required', 422); }
if ($rating < 1 || $rating > 5) { json_error('rating must be between 1 and 5', 422); }

// Ensure table exists
mysqli_query($con, "CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  photo_url VARCHAR(1024) NULL,
  approved TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

if ($id > 0) {
    if ($approved === null) {
        $stmt = mysqli_prepare($con, 'UPDATE testimonials SET name=?, content=?, rating=?, photo_url=? WHERE id=?');
        if (!$stmt) { json_error('Failed to prepare update', 500); }
        mysqli_stmt_bind_param($stmt, 'ssisi', $name, $content, $rating, $photo_url, $id);
    } else {
        $stmt = mysqli_prepare($con, 'UPDATE testimonials SET name=?, content=?, rating=?, photo_url=?, approved=? WHERE id=?');
        if (!$stmt) { json_error('Failed to prepare update', 500); }
        mysqli_stmt_bind_param($stmt, 'ssisii', $name, $content, $rating, $photo_url, $approved, $id);
    }
    if (!mysqli_stmt_execute($stmt)) { json_error('Failed to update testimonial', 500); }
    json_ok(['id' => $id, 'name' => $name, 'content' => $content, 'rating' => $rating, 'photo_url' => $photo_url, 'approved' => $approved === null ? null : (bool)$approved]);
} else {
    $stmt = mysqli_prepare($con, 'INSERT INTO testimonials (name, content, rating, photo_url, approved) VALUES (?, ?, ?, ?, ?)');
    if (!$stmt) { json_error('Failed to prepare insert', 500); }
    $appr = $approved === null ? 0 : $approved;
    mysqli_stmt_bind_param($stmt, 'ssisi', $name, $content, $rating, $photo_url, $appr);
    if (!mysqli_stmt_execute($stmt)) { json_error('Failed to create testimonial', 500); }
    $newId = (int)mysqli_insert_id($con);
    json_ok(['id' => $newId, 'name' => $name, 'content' => $content, 'rating' => $rating, 'photo_url' => $photo_url, 'approved' => (bool)$appr], 201);
}
