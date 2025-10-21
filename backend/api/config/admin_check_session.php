<?php
require_once __DIR__ . '/../utils/cors.php';
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
