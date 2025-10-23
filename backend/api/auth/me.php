<?php
require_once __DIR__ . '/../utils/bootstrap.php';

// Add CORS headers for frontend access
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';

$userId = $_SESSION['user_id'] ?? null;

$profile = [
    'authenticated' => !is_null($userId),
    'id' => (int)($userId ?? 0),
    'is_admin' => false,
    'role' => 'user',
];

// If we have a real user session, enrich with stored profile data
if ($userId) {
    if ($stmt = $con->prepare("SELECT user_firstname, user_surname, user_email, user_username, profile_picture, role FROM signup WHERE user_id = ?")) {
        $stmt->bind_param('i', $userId);
        if ($stmt->execute()) {
            $res = $stmt->get_result();
            if ($row = $res->fetch_assoc()) {
                $profile['firstName'] = $row['user_firstname'] ?? null;
                $profile['lastName'] = $row['user_surname'] ?? null;
                $profile['email'] = $row['user_email'] ?? null;
                $profile['username'] = $row['user_username'] ?? null;
                $profile['name'] = trim(($row['user_firstname'] ?? '') . ' ' . ($row['user_surname'] ?? ''));
                $profile['avatarUrl'] = $row['profile_picture'] ?? null;
                $profile['role'] = $row['role'] ?? 'user';
                $profile['is_admin'] = ($row['role'] ?? 'user') === 'admin';
            }
        }
    }
}

json_ok($profile);
