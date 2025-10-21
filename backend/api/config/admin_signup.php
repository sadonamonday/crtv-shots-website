<?php
require_once __DIR__ . '/../utils/cors.php';
header('Content-Type: application/json');

session_start();
include __DIR__ . "/database.php";
require __DIR__ . "/../../../vendor/autoload.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$required = ['user_firstname','user_surname','user_username','user_email','user_password','user_address','user_contact'];
foreach ($required as $key) {
    if (!isset($_POST[$key])) {
        echo json_encode(["success" => false, "message" => "Missing field: $key"]);
        exit;
    }
}

$user_firstname = trim($_POST['user_firstname']);
$user_surname   = trim($_POST['user_surname']);
$user_username  = trim($_POST['user_username']);
$user_email     = trim($_POST['user_email']);
$user_password  = $_POST['user_password'];
$user_address   = trim($_POST['user_address']);
$user_contact   = str_replace(' ', '', $_POST['user_contact']);

$errors = [];
if (empty($user_firstname) || strlen($user_firstname) < 2) $errors[] = "First name must be at least 2 characters.";
if (empty($user_surname) || strlen($user_surname) < 2) $errors[] = "Surname must be at least 2 characters.";
if (!filter_var($user_email, FILTER_VALIDATE_EMAIL)) $errors[] = "Please enter a valid email address.";
if ($user_password && strlen($user_password) < 8) $errors[] = "Password must be at least 8 characters.";
if (empty($user_address)) $errors[] = "Address is required.";

if ($errors) {
    echo json_encode(["success" => false, "message" => implode(" ", $errors)]);
    exit;
}

// Ensure required columns exist in DB: is_admin TINYINT(1) DEFAULT 0, verification_token, verification_token_expires_at, email_verified, two_factor_code, two_factor_expires_at

// Username unique check
$stmt = $con->prepare("SELECT user_id FROM signup WHERE user_username=?");
$stmt->bind_param("s", $user_username);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Username already exists."]);
    exit;
}
$stmt->close();

// Email unique check
$stmt = $con->prepare("SELECT user_id FROM signup WHERE user_email=?");
$stmt->bind_param("s", $user_email);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Email already registered."]);
    exit;
}
$stmt->close();

$hash_password = password_hash($user_password, PASSWORD_DEFAULT);
$token = bin2hex(random_bytes(32));
$expires = date("Y-m-d H:i:s", strtotime("+1 day"));
if (preg_match('/^0[0-9]{9}$/', $user_contact)) $user_contact = '+27' . substr($user_contact, 1);
$user_ip = $_SERVER['REMOTE_ADDR'] ?? '';

// Insert as admin (requires is_admin column)
$insert = $con->prepare("INSERT INTO signup (user_firstname,user_surname,user_username,user_email,user_password,user_ip,user_address,user_contact,verification_token,verification_token_expires_at,is_admin) VALUES (?,?,?,?,?,?,?,?,?,?,1)");
$insert->bind_param("ssssssssss", $user_firstname, $user_surname, $user_username, $user_email, $hash_password, $user_ip, $user_address, $user_contact, $token, $expires);

if (!$insert->execute()) {
    echo json_encode(["success" => false, "message" => "Signup failed, please try again."]);
    exit;
}

$verify_link = "http://localhost/crtv-shots-website/backend/api/config/verify_email.php?token=$token";
$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'ngwenya1305@gmail.com';
    $mail->Password = 'ghsr bssh ztza ulid';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    $mail->setFrom('no-reply@crtvshots.com', 'CRTVSHOTS Admin');
    $mail->addAddress($user_email, $user_firstname);
    $mail->isHTML(true);
    $mail->Subject = "Verify your admin email";
    $mail->Body = "<p>Hello $user_firstname,</p><p>Click below to verify your admin account email:</p><p><a href='$verify_link'>Verify Email</a></p>";
    $mail->send();
} catch (Exception $e) {
    // continue even if email fails, but inform the client
}

echo json_encode(["success" => true, "message" => "Admin signup successful! Check your email to verify your account."]);
