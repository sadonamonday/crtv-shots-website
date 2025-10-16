<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");


session_start();
include __DIR__ . "/database.php";

header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if (isset($_POST['user_email'], $_POST['user_password'])) {
    $email = trim($_POST['user_email']);
    $password = $_POST['user_password'];

    $stmt = $con->prepare("SELECT * FROM signup WHERE user_email=?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();

    if ($user && password_verify($password, $user['user_password'])) {
        if ($user['email_verified'] == 1) {
            $_SESSION['user_id'] = $user['user_id'];
            $response['success'] = true;
            $response['message'] = 'Login successful';
        } else {
            $response['message'] = 'Please verify your email before logging in.';
        }
    } else {
        $response['message'] = 'Invalid email or password.';
    }
} else {
    $response['message'] = 'Email and password are required.';
}

echo json_encode($response);
