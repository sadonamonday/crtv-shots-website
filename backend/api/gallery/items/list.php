<?php
require_once __DIR__ . '/../../utils/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';

// Allow CORS similar to gallery/list.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method Not Allowed', 405);
}

// Ensure tables exist
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

// media table assumed to exist, but do not create here

$isAdmin = !empty($_SESSION['is_admin']);
$where = $isAdmin && isset($_GET['all']) ? '1=1' : 'gi.visible = 1';

$sql = "SELECT gi.id, gi.media_id, COALESCE(gi.title,'') AS title, COALESCE(gi.description,'') AS description,
               gi.sort_order, gi.visible, gi.created_at,
               m.url AS media_url, m.alt AS media_alt, m.type AS media_type
        FROM gallery_items gi
        LEFT JOIN media m ON m.id = gi.media_id
        WHERE $where
        ORDER BY gi.sort_order DESC, gi.id DESC";
$res = mysqli_query($con, $sql);
if ($res === false) {
    json_error('Failed to load items', 500);
}
$out = [];
while ($row = mysqli_fetch_assoc($res)) {
    $out[] = [
        'id' => (int)$row['id'],
        'media_id' => $row['media_id'] !== null ? (int)$row['media_id'] : null,
        'title' => (string)$row['title'],
        'description' => (string)$row['description'],
        'sort_order' => (int)$row['sort_order'],
        'visible' => (int)$row['visible'] === 1,
        'created_at' => $row['created_at'],
        'media' => [
            'url' => $row['media_url'],
            'alt' => $row['media_alt'],
            'type' => $row['media_type'],
        ],
    ];
}
json_ok($out);
