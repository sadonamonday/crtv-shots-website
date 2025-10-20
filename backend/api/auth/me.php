<?php
require_once __DIR__ . '/../../utils/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';

// Returns 200 with minimal user info if logged in, else 401
$userId = $_SESSION['user_id'] ?? null;
if (!$userId) {
    json_error('Unauthorized', 401);
}

// Try to fetch basic profile if table exists; fallback to id only
$profile = [ 'id' => (int)$userId ];

// Attach simple admin flags from session if available
if (isset($_SESSION['is_admin'])) {
    $profile['isAdmin'] = (bool)$_SESSION['is_admin'];
}
if (isset($_SESSION['role'])) {
    $profile['role'] = $_SESSION['role'];
}

// Try signup table
if ($stmt = $con->prepare("SELECT user_firstname, user_surname, user_email, is_admin FROM signup WHERE user_id = ?")) {
    $stmt->bind_param('i', $userId);
    if ($stmt->execute()) {
        $res = $stmt->get_result();
        if ($row = $res->fetch_assoc()) {
            $profile['firstName'] = $row['user_firstname'] ?? null;
            $profile['lastName'] = $row['user_surname'] ?? null;
            $profile['email'] = $row['user_email'] ?? null;
            $profile['name'] = trim(($row['user_firstname'] ?? '') . ' ' . ($row['user_surname'] ?? ''));
            if (!isset($profile['isAdmin']) && array_key_exists('is_admin', $row)) {
                $profile['isAdmin'] = (bool)$row['is_admin'];
            }
            if (!isset($profile['role'])) {
                $profile['role'] = ($profile['isAdmin'] ?? false) ? 'admin' : 'user';
            }
        }
    }
}

json_ok($profile);
