<?php
// Common bootstrap: CORS and JSON helpers
// Use centralized session bootstrap to ensure consistent cookie name and SameSite settings
require_once __DIR__ . '/session.php';

// Ensure session is started (redundant guard in case this file is used without session.php changes)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// JSON APIs default to application/json
header('Content-Type: application/json; charset=utf-8');

// Centralized CORS
require_once __DIR__ . '/cors.php';

function json_input(): array {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    return is_array($data) ? $data : [];
}

function json_error(string $message, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}

function json_ok($payload = null, int $code = 200): void {
    http_response_code($code);
    if ($payload === null) {
        echo json_encode(['ok' => true]);
    } else {
        echo json_encode($payload);
    }
    exit;
}
