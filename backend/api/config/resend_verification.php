<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
header('Content-Type: application/json');

include 'database.php';
session_start();

// Use Composer autoloader for PHPMailer (relative to project root)
require __DIR__ . "/../../../vendor/autoload.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if (!isset($_POST['user_email'])) {
    echo json_encode(["success" => false, "message" => "Email is required."]);
    exit;
}

$email = trim($_POST['user_email']);

// Fetch user
$stmt = $con->prepare("SELECT user_id, email_verified, verification_token FROM signup WHERE user_email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Email not registered."]);
    $stmt->close();
    $con->close();
    exit;
}

$row = $result->fetch_assoc();

if ($row['email_verified'] == 1) {
    echo json_encode(["success" => false, "message" => "Email already verified."]);
    $stmt->close();
    $con->close();
    exit;
}

// Generate new verification token if not exist
if (empty($row['verification_token'])) {
    $token = bin2hex(random_bytes(16));
    $stmt_update = $con->prepare("UPDATE signup SET verification_token = ? WHERE user_id = ?");
    $stmt_update->bind_param("si", $token, $row['user_id']);
    $stmt_update->execute();
    $stmt_update->close();
} else {
    $token = $row['verification_token'];
}

// Send verification email
$verificationLink = "http://localhost:8000/config/verify_email.php?token=$token";

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'ngwenya1305@gmail.com';
    $mail->Password = 'ghsr bssh ztza ulid'; // Gmail App Password
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;

    $mail->setFrom('no-reply@crtvshots.com', 'CRTV Shots');
    $mail->addAddress($email);

    $mail->isHTML(true);
    $mail->Subject = 'Verify Your Email';
    $mail->Body = "Click the link to verify your email: <a href='$verificationLink'>Verify Email</a>";

    $mail->send();

    echo json_encode(["success" => true, "message" => "Verification email sent."]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Mailer Error: " . $mail->ErrorInfo]);
}

$stmt->close();
$con->close();
?>
