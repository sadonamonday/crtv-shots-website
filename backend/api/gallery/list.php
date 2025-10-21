<?php
require_once __DIR__ . '/../../utils/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';


// Ensure table exists
mysqli_query($con, "CREATE TABLE IF NOT EXISTS gallery_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  title VARCHAR(255) DEFAULT NULL,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  sort INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET') {
    json_error('Method Not Allowed', 405);
}

// Detect admin: simple session flag
$isAdmin = !empty($_SESSION['is_admin']);

$where = $isAdmin && isset($_GET['all']) ? '1=1' : 'visible = 1';
$sql = "SELECT id, filename, COALESCE(title,'') AS title, visible, sort, created_at FROM gallery_photos WHERE $where ORDER BY sort DESC, id DESC";
$res = mysqli_query($con, $sql);
if ($res === false) {
    json_error('Failed to load images', 500);
}

$basePath = '/backend/Gallery/uploads/';
$out = [];
while ($row = mysqli_fetch_assoc($res)) {
    $out[] = [
        'id' => (int)$row['id'],
        'title' => $row['title'],
        'visible' => (int)$row['visible'] === 1,
        'sort' => (int)$row['sort'],
        'url' => $basePath . $row['filename'],
        'filename' => $row['filename'],
        'createdAt' => $row['created_at'],
    ];
}
json_ok($out);
