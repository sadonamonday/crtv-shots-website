<?php
require_once __DIR__ . '/../utils/cors.php';
header('Content-Type: application/json');

include __DIR__ . '/database.php';
require_once __DIR__ . '/toggles.php';
require_once __DIR__ . '/../utils/session.php';

if (!isset($_POST['user_email']) || !isset($_POST['two_factor_code'])) {
    echo json_encode(["success" => false, "message" => "Email and code required."]);
    exit;
}

$email = trim($_POST['user_email']);
$code = trim($_POST['two_factor_code']);

// Only verify for admin accounts
$stmt = $con->prepare("SELECT user_id, two_factor_code, two_factor_expires_at FROM signup WHERE user_email = ? AND is_admin = 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Admin not found or not authorized."]);
    exit;
}

$row = $result->fetch_assoc();
$current_time = date("Y-m-d H:i:s");

// If 2FA is disabled, treat as success
if (defined('DISABLE_2FA') && DISABLE_2FA === true) {
    $_SESSION['admin_id'] = $row['user_id'];
    unset($_SESSION['admin_pending_id']);
    echo json_encode(["success" => true, "message" => "2FA disabled: admin auto-verified."]);
    $stmt->close();
    $con->close();
    exit;
}

if ($row['two_factor_code'] === $code && $row['two_factor_expires_at'] >= $current_time) {
    // Clear code
    $update = $con->prepare("UPDATE signup SET two_factor_code = NULL, two_factor_expires_at = NULL WHERE user_id = ?");
    $update->bind_param("i", $row['user_id']);
    $update->execute();
    $update->close();

    // Establish admin session
    $_SESSION['admin_id'] = $row['user_id'];
    // Normalize session flags used across the app
    $_SESSION['user_id'] = $row['user_id'];
    $_SESSION['is_admin'] = 1;
    $_SESSION['role'] = 'admin';
    unset($_SESSION['admin_pending_id']);

    echo json_encode(["success" => true, "message" => "Admin 2FA verified successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Invalid or expired 2FA code."]);
}

$stmt->close();
$con->close();
?>