<?php
// Simple JSON API for testimonials list
// Method: GET -> returns array of { id, name, content, message, rating, photo_url?, created_at? }

require_once __DIR__ . '/../utils/cors.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([ 'error' => 'Method Not Allowed' ]);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

// Fetch testimonials using schema columns: id, name, rating, content, photo_url, approved, created_at
$sql = "SELECT id, name, content, rating, photo_url, created_at FROM testimonials WHERE approved = 1 ORDER BY id DESC";
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
