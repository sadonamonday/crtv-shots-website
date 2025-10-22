<?php
// Simple JSON API for testimonials list
// Method: GET -> returns array of { id, name, content, message, rating, photo_url?, created_at? }

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([ 'error' => 'Method Not Allowed' ]);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

// Optional filters: approved (default 1), rating
$approved = isset($_GET['approved']) ? trim($_GET['approved']) : '1';
$rating = isset($_GET['rating']) ? (int)$_GET['rating'] : 0;

$conds = [];
if ($approved !== '') { $conds[] = 'approved = ' . (($approved === '1' || strtolower($approved) === 'true') ? '1' : '0'); }
if ($rating > 0) { $conds[] = 'rating = ' . (int)$rating; }

$sql = "SELECT id, name, content, rating, photo_url, created_at FROM testimonials";
if (!empty($conds)) { $sql .= ' WHERE ' . implode(' AND ', $conds); }
$sql .= " ORDER BY id DESC";

$result = mysqli_query($con, $sql);
if ($result === false) {
    http_response_code(500);
    echo json_encode([ 'error' => 'Failed to query testimonials' ]);
    exit;
}

$rows = [];
while ($row = mysqli_fetch_assoc($result)) {
    $content = $row['content'] ?? '';
    $rows[] = [
        'id' => isset($row['id']) ? (int)$row['id'] : null,
        'name' => $row['name'] ?? '',
        // Provide both 'content' (aligns with DB) and legacy 'message' for compatibility
        'content' => $content,
        'message' => $content,
        'rating' => isset($row['rating']) ? (int)$row['rating'] : 0,
        'photo_url' => $row['photo_url'] ?? null,
        'created_at' => $row['created_at'] ?? null,
    ];
}

echo json_encode($rows);
