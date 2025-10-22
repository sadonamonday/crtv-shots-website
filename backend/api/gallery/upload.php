<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

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

$title = isset($_POST['title']) ? trim((string)$_POST['title']) : '';
$visible = isset($_POST['visible']) ? (int)!!$_POST['visible'] : 1;
$sort = isset($_POST['sort']) ? (int)$_POST['sort'] : 0;

// Support two modes: file upload or external URL download
$url = isset($_POST['url']) ? trim((string)$_POST['url']) : '';
$allowedExt = ['jpg','jpeg','png','gif','webp'];
$size = 0;

if ($url !== '') {
    // Validate URL
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        json_error('Invalid URL provided.', 422);
    }
    // Only allow http/https
    $scheme = parse_url($url, PHP_URL_SCHEME);
    if (!in_array(strtolower($scheme), ['http','https'], true)) {
        json_error('Unsupported URL scheme.', 422);
    }

    // Attempt to fetch headers to guess extension
    $ext = strtolower(pathinfo(parse_url($url, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION));
    if (!$ext || !in_array($ext, $allowedExt, true)) {
        // Try to infer from content-type
        $headers = @get_headers($url, 1);
        $ctype = '';
        if (is_array($headers)) {
            foreach ($headers as $k => $v) {
                if (strcasecmp((string)$k, 'Content-Type') === 0) {
                    $ctype = is_array($v) ? end($v) : $v;
                    break;
                }
            }
        }
        if (is_string($ctype) && strpos($ctype, 'image/') === 0) {
            $map = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp'];
            $ext = $map[strtolower($ctype)] ?? '';
        }
    }
    if (!$ext || !in_array($ext, $allowedExt, true)) {
        // default to jpg if nothing else
        $ext = 'jpg';
    }

    $basename = bin2hex(random_bytes(8)) . '_url';
    $filename = $basename . '.' . $ext;
    $target = $uploadDir . DIRECTORY_SEPARATOR . $filename;

    // Download to file
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 20,
            'follow_location' => 1,
            'header' => "User-Agent: CRTVShotsBot/1.0\r\n",
        ],
        'https' => [
            'method' => 'GET',
            'timeout' => 20,
            'header' => "User-Agent: CRTVShotsBot/1.0\r\n",
        ],
    ]);
    $data = @file_get_contents($url, false, $context);
    if ($data === false) {
        json_error('Failed to download image from URL.', 422);
    }
    $size = strlen($data);
    if ($size < 1) {
        json_error('Downloaded file is empty.', 422);
    }
    if (@file_put_contents($target, $data) === false) {
        json_error('Failed to store downloaded image.', 500);
    }

    // Validate mime by content
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($target);
    if (strpos((string)$mime, 'image/') !== 0) {
        @unlink($target);
        json_error('Downloaded file is not an image.', 415);
    }
} else {
    if (empty($_FILES['image']) && !empty($_FILES['file'])) {
        $_FILES['image'] = $_FILES['file'];
    }

    if (empty($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        json_error('No image uploaded or upload error.', 422);
    }

    $tmp = $_FILES['image']['tmp_name'];
    $origName = $_FILES['image']['name'];
    $size = (int)$_FILES['image']['size'];

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
}

$stmt = $con->prepare('INSERT INTO gallery_photos (filename, title, visible, sort) VALUES (?, ?, ?, ?)');
$stmt->bind_param('ssii', $filename, $title, $visible, $sort);
if (!$stmt->execute()) {
    @isset($target) && is_file($target) ? @unlink($target) : null;
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
