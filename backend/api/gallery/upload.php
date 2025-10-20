<?php
require_once __DIR__ . '/../../utils/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method Not Allowed', 405);
}

// Admin guard
$isAdmin = !empty($_SESSION['is_admin']);
if (!$isAdmin) {
    json_error('Forbidden', 403);
}

// Ensure table exists
mysqli_query($con, "CREATE TABLE IF NOT EXISTS gallery_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  title VARCHAR(255) DEFAULT NULL,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  sort INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$uploadDir = realpath(__DIR__ . '/../../..') . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'Gallery' . DIRECTORY_SEPARATOR . 'uploads';
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0775, true);
}

if (empty($_FILES['image']) && !empty($_FILES['file'])) {
    $_FILES['image'] = $_FILES['file'];
}

if (empty($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    json_error('No image uploaded or upload error.', 422);
}

$title = isset($_POST['title']) ? trim((string)$_POST['title']) : '';
$visible = isset($_POST['visible']) ? (int)!!$_POST['visible'] : 1;
$sort = isset($_POST['sort']) ? (int)$_POST['sort'] : 0;

$tmp = $_FILES['image']['tmp_name'];
$origName = $_FILES['image']['name'];
$size = (int)$_FILES['image']['size'];

$allowedExt = ['jpg','jpeg','png','gif','webp'];
$ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
if (!in_array($ext, $allowedExt, true)) {
    json_error('Unsupported file type.', 415);
}

// Basic content check
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($tmp);
if (strpos($mime, 'image/') !== 0) {
    json_error('Uploaded file is not an image.', 415);
}

$basename = bin2hex(random_bytes(8)) . '_' . preg_replace('/[^a-zA-Z0-9_-]/', '', pathinfo($origName, PATHINFO_FILENAME));
$filename = $basename . '.' . $ext;
$target = $uploadDir . DIRECTORY_SEPARATOR . $filename;

if (!move_uploaded_file($tmp, $target)) {
    json_error('Failed to store uploaded file.', 500);
}

$stmt = $con->prepare('INSERT INTO gallery_photos (filename, title, visible, sort) VALUES (?, ?, ?, ?)');
$stmt->bind_param('ssii', $filename, $title, $visible, $sort);
if (!$stmt->execute()) {
    @unlink($target);
    json_error('Failed to save record.', 500);
}

$publicUrl = '/backend/Gallery/uploads/' . $filename;
json_ok([
    'id' => $stmt->insert_id,
    'title' => $title,
    'visible' => (bool)$visible,
    'sort' => $sort,
    'url' => $publicUrl,
    'filename' => $filename,
    'size' => $size,
], 201);
