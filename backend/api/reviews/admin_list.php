<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') { json_error('Method not allowed', 405); }

// Ensure testimonials table exists (safe no-op)
mysqli_query($con, "CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  photo_url VARCHAR(1024) NULL,
  approved TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$approved = isset($_GET['approved']) ? trim($_GET['approved']) : '';
$rating = isset($_GET['rating']) ? (int)$_GET['rating'] : 0;

$conds = [];
$params = [];
$types = '';
if ($approved !== '') { $conds[] = 'approved = ?'; $params[] = ($approved === '1' || strtolower($approved) === 'true') ? 1 : 0; $types .= 'i'; }
if ($rating > 0) { $conds[] = 'rating = ?'; $params[] = $rating; $types .= 'i'; }

$sql = 'SELECT id, name, content, rating, photo_url, approved, created_at FROM testimonials';
if (!empty($conds)) { $sql .= ' WHERE ' . implode(' AND ', $conds); }
$sql .= ' ORDER BY id DESC LIMIT 1000';

if (!empty($conds)) {
    $stmt = mysqli_prepare($con, $sql);
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, $types, ...$params);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
    } else { $res = false; }
} else {
    $res = mysqli_query($con, $sql);
}

$out = [];
if ($res) {
    while ($row = mysqli_fetch_assoc($res)) {
        $out[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'content' => $row['content'],
            'rating' => (int)$row['rating'],
            'photo_url' => $row['photo_url'] ?? null,
            'approved' => (int)$row['approved'] === 1,
            'created_at' => $row['created_at'] ?? null,
        ];
    }
}

json_ok($out);
