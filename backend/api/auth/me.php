<?php
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

// Allow anyone to act as admin: always return authenticated and admin role
$userId = $_SESSION['user_id'] ?? null;

$profile = [
    'authenticated' => true,
    'id' => (int)($userId ?? 0),
    'is_admin' => true,
    'role' => 'admin',
];

// If we have a real user session, enrich with stored profile data
if ($userId) {
    if ($stmt = $con->prepare("SELECT user_firstname, user_surname, user_email FROM signup WHERE user_id = ?")) {
        $stmt->bind_param('i', $userId);
        if ($stmt->execute()) {
            $res = $stmt->get_result();
            if ($row = $res->fetch_assoc()) {
                $profile['firstName'] = $row['user_firstname'] ?? null;
                $profile['lastName'] = $row['user_surname'] ?? null;
                $profile['email'] = $row['user_email'] ?? null;
                $profile['name'] = trim(($row['user_firstname'] ?? '') . ' ' . ($row['user_surname'] ?? ''));
            }
        }
    }
}

json_ok($profile);
