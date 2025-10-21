<?php
session_start();
header('Content-Type: application/json');

include __DIR__ . "/database.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['user_email'] ?? '';
    $current_password = $input['current_password'] ?? '';
    $new_password = $input['new_password'] ?? '';

    if (!$email || !$current_password || !$new_password) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit;
    }

    // Fetch current password hash
    $stmt = $con->prepare("SELECT user_password FROM signup WHERE user_email=?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($user = $result->fetch_assoc()) {
        if (!password_verify($current_password, $user['user_password'])) {
            echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
            exit;
        }

        if ($current_password === $new_password) {
            echo json_encode(['success' => false, 'message' => 'New password cannot be the same as current password']);
            exit;
        }

        // Validate new password
        $pwd_errors = [];
        if (strlen($new_password) < 8) $pwd_errors[] = "at least 8 characters";
        if (!preg_match('/[A-Z]/', $new_password)) $pwd_errors[] = "an uppercase letter";
        if (!preg_match('/[0-9]/', $new_password)) $pwd_errors[] = "a number";
        if (!preg_match('/[\W]/', $new_password)) $pwd_errors[] = "a special character";
        if ($pwd_errors) {
            echo json_encode(['success' => false, 'message' => 'Password must contain ' . implode(", ", $pwd_errors)]);
            exit;
        }

        $hash = password_hash($new_password, PASSWORD_DEFAULT);
        $update = $con->prepare("UPDATE signup SET user_password=? WHERE user_email=?");
        $update->bind_param("ss", $hash, $email);

        if ($update->execute()) {
            echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update password']);
        }

    } else {
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
