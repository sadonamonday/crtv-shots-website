<?php
require_once __DIR__ . '/../utils/cors.php';
header('Content-Type: application/json');

include 'database.php';
require __DIR__ . "/../../../vendor/autoload.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if (!isset($_POST['user_email'])) {
    echo json_encode(["success" => false, "message" => "Email is required."]);
    exit;
}

$email = trim($_POST['user_email']);
$stmt = $con->prepare("SELECT user_id FROM signup WHERE user_email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Email not registered."]);
    exit;
}

$row = $result->fetch_assoc();
$twoFA = rand(100000, 999999);
$expires = date("Y-m-d H:i:s", strtotime("+5 minutes"));

$update = $con->prepare("UPDATE signup SET two_factor_code = ?, two_factor_expires_at = ? WHERE user_id = ?");
$update->bind_param("ssi", $twoFA, $expires, $row['user_id']);
$update->execute();

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'ngwenya1305@gmail.com';
    $mail->Password = 'ghsr bssh ztza ulid';
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;

    $mail->setFrom('no-reply@crtvshots.com', 'CRTV Shots');
    $mail->addAddress($email);
    $mail->isHTML(true);
    $mail->Subject = 'Your new 2FA verification code';
    $mail->Body = "Your new verification code is: <b>$twoFA</b>. It expires in 5 minutes.";

    $mail->send();
    echo json_encode(["success" => true, "message" => "Verification code resent successfully."]);
} catch (Exception $e) {
    error_log("Mailer Error: " . $mail->ErrorInfo);
    echo json_encode(["success" => false, "message" => "Failed to send email."]);
}
