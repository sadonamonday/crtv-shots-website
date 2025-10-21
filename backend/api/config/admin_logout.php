<?php
require_once __DIR__ . '/../utils/cors.php';
header('Content-Type: application/json');

require_once __DIR__ . '/../utils/session.php';

// Unset all of the session variables.
$_SESSION = [];

// If it's desired to kill the session, also delete the session cookie.
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Finally, destroy the session.
session_destroy();

echo json_encode(["success" => true]);
