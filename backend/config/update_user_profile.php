<?php
session_start();
header('Content-Type: application/json');

include __DIR__ . "/database.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['user_email'] ?? '';
    $username = $input['user_username'] ?? '';
    $address = $input['user_address'] ?? '';
    $contact = $input['user_contact'] ?? '';

    if (!$email || !$username || !$address || !$contact) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit;
    }

    // Check if username already exists for another user
    $stmt = $con->prepare("SELECT user_id FROM signup WHERE user_username=? AND user_email<>?");
    $stmt->bind_param("ss", $username, $email);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Username already taken']);
        exit;
    }

    $stmt = $con->prepare("UPDATE signup SET user_username=?, user_address=?, user_contact=? WHERE user_email=?");
    $stmt->bind_param("ssss", $username, $address, $contact, $email);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
