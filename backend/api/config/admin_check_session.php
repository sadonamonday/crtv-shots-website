<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
header('Content-Type: application/json');

require_once __DIR__ . '/../utils/session.php';

// Allow anyone to act as admin: always return success
$response = [
    'success' => true,
];

if (isset($_SESSION['admin_id']) && !empty($_SESSION['admin_id'])) {
    $response['admin_id'] = $_SESSION['admin_id'];
}

echo json_encode($response);
