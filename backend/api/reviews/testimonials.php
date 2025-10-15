<?php
// Simple JSON API for testimonials list
// Method: GET -> returns array of { id, name, message, rating }

header('Content-Type: application/json; charset=utf-8');
// Basic CORS support (adjust origin as needed)
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
    header('Vary: Origin');
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([ 'error' => 'Method Not Allowed' ]);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

// Fetch testimonials
$sql = "SELECT id, name, message, rating FROM testimonials ORDER BY id DESC";
$result = mysqli_query($con, $sql);
if ($result === false) {
    http_response_code(500);
    echo json_encode([ 'error' => 'Failed to query testimonials' ]);
    exit;
}

$rows = [];
while ($row = mysqli_fetch_assoc($result)) {
    $rows[] = [
        'id' => isset($row['id']) ? (int)$row['id'] : null,
        'name' => $row['name'] ?? '',
        'message' => $row['message'] ?? '',
        'rating' => isset($row['rating']) ? (int)$row['rating'] : 0,
    ];
}

echo json_encode($rows);
