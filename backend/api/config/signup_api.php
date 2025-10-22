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

session_start();
include __DIR__ . "/database.php";
require __DIR__ . "/../../../vendor/autoload.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$errors = [];
$username_suggestions = [];

// ---------- FORM HANDLER ----------
if (isset($_POST['signup'])) {
    $user_firstname = trim($_POST['user_firstname']);
    $user_surname = trim($_POST['user_surname']);
    $user_username = trim($_POST['user_username']);
    $user_email = trim($_POST['user_email']);
    $user_password = $_POST['user_password'];
    $conf_user_password = $_POST['conf_user_password'];
    $user_address = trim($_POST['user_address']);
    $user_contact = str_replace(' ', '', $_POST['user_contact']);

    // ---------- VALIDATIONS ----------
    if (empty($user_firstname) || strlen($user_firstname) < 2)
        $errors[] = "First name must be at least 2 characters.";

    if (empty($user_surname) || strlen($user_surname) < 2)
        $errors[] = "Surname must be at least 2 characters.";

    if (!filter_var($user_email, FILTER_VALIDATE_EMAIL) || !str_ends_with($user_email, '@gmail.com'))
        $errors[] = "Please enter a valid Gmail address.";

    if (!preg_match('/^(\+27|0)[0-9]{9}$/', $user_contact))
        $errors[] = "Enter a valid SA contact number (e.g., 0612345678 or +27612345678).";

    if ($user_password !== $conf_user_password)
        $errors[] = "Passwords do not match.";
    else {
        $pwd_errors = [];
        if (strlen($user_password) < 8) $pwd_errors[] = "at least 8 characters";
        if (!preg_match('/[A-Z]/', $user_password)) $pwd_errors[] = "an uppercase letter";
        if (!preg_match('/[0-9]/', $user_password)) $pwd_errors[] = "a number";
        if (!preg_match('/[\W]/', $user_password)) $pwd_errors[] = "a special character";
        if ($pwd_errors) $errors[] = "Password must contain " . implode(", ", $pwd_errors) . ".";
    }

    if (empty($user_address)) $errors[] = "Address is required.";

    // ---------- CHECK USERNAME ----------
    $stmt = $con->prepare("SELECT user_id FROM signup WHERE user_username=?");
    $stmt->bind_param("s", $user_username);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        $errors[] = "Username already exists.";
        for ($i = 0; $i < 5; $i++) {
            $suggest = $user_username . rand(10, 99);
            $r = $con->prepare("SELECT user_id FROM signup WHERE user_username=?");
            $r->bind_param("s", $suggest);
            $r->execute();
            if ($r->get_result()->num_rows == 0) $username_suggestions[] = $suggest;
        }
    }
    $stmt->close();

    // ---------- CHECK EMAIL ----------
    $stmt = $con->prepare("SELECT user_id FROM signup WHERE user_email=?");
    $stmt->bind_param("s", $user_email);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0)
        $errors[] = "Email already registered.";
    $stmt->close();

    // ---------- INSERT INTO DATABASE ----------
    if (empty($errors)) {
        $hash_password = password_hash($user_password, PASSWORD_DEFAULT);
        $token = bin2hex(random_bytes(32));
        $expires = date("Y-m-d H:i:s", strtotime("+1 day"));
        if (preg_match('/^0[0-9]{9}$/', $user_contact)) $user_contact = '+27' . substr($user_contact, 1);

        $insert = $con->prepare("INSERT INTO signup (user_firstname,user_surname,user_username,user_email,user_password,user_ip,user_address,user_contact,verification_token,verification_token_expires_at) VALUES (?,?,?,?,?,?,?,?,?,?)");
        $user_ip = $_SERVER['REMOTE_ADDR'];
        $insert->bind_param("ssssssssss", $user_firstname, $user_surname, $user_username, $user_email, $hash_password, $user_ip, $user_address, $user_contact, $token, $expires);

        if ($insert->execute()) {
            $verify_link = "http://localhost:8000/config/verify_email.php?token=$token";
            $mail = new PHPMailer(true);
            try {
                $mail->isSMTP();
                $mail->Host = 'smtp.gmail.com';
                $mail->SMTPAuth = true;
                $mail->Username = 'ngwenya1305@gmail.com';
                $mail->Password = 'ghsr bssh ztza ulid';
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port = 587;
                $mail->setFrom('no-reply@crtvshots.com', 'CRTV Shots');
                $mail->addAddress($user_email, $user_firstname);
                $mail->isHTML(true);
                $mail->Subject = "Verify your email";
                $mail->Body = "<p>Hello $user_firstname,</p><p>Click below to verify your email:</p><p><a href='$verify_link'>Verify Email</a></p>";
                $mail->send();
                
                echo json_encode([
                    "success" => true,
                    "message" => "Signup successful! Check your email to verify your account.",
                    "username_suggestions" => $username_suggestions
                ]);
                exit;
            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Signup successful, but email could not be sent: " . $mail->ErrorInfo
                ]);
                exit;
            }
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Signup failed, please try again."
            ]);
            exit;
        }
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Validation errors",
            "errors" => $errors,
            "username_suggestions" => $username_suggestions
        ]);
        exit;
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "No signup data received."
    ]);
    exit;
}
?>
