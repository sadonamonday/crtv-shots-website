<?php
session_start();
header('Content-Type: application/json');

include __DIR__ . "/database.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['user_email'] ?? '';

    if (!$email) {
        echo json_encode(['success' => false, 'message' => 'Email not provided']);
        exit;
    }

    $stmt = $con->prepare("SELECT user_firstname, user_surname, user_username, user_email, user_address, user_contact FROM signup WHERE user_email=?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($user = $result->fetch_assoc()) {
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
