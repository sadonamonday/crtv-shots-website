<?php
session_start();
include __DIR__ . "/database.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../../../vendor/autoload.php';



$message = "";
$email_val = "";

if (isset($_POST['forgot_password'])) {
    $user_email = trim($_POST['user_email']);
    $email_val = htmlspecialchars($user_email);

    // Check if email exists
    $check_query = "SELECT * FROM `signup` WHERE user_email=?";
    $stmt = mysqli_prepare($con, $check_query);
    mysqli_stmt_bind_param($stmt, "s", $user_email);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    if (mysqli_num_rows($result) > 0) {
        // Generate secure token
        $token = bin2hex(random_bytes(16));
        $token_hash = hash("sha256", $token);
        $expiry = date("Y-m-d H:i:s", strtotime('+1 hour'));

        // Update DB
        $update_query = "UPDATE `signup` 
                         SET reset_token_hash=?, reset_token_expires_at=? 
                         WHERE user_email=?";
        $stmt = mysqli_prepare($con, $update_query);
        mysqli_stmt_bind_param($stmt, "sss", $token_hash, $expiry, $user_email);
        mysqli_stmt_execute($stmt);

        // Send reset email using PHPMailer
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'ngwenya1305@gmail.com'; // Change to your email
            $mail->Password   = 'ghsr bssh ztza ulid';    // Use Gmail App Password
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;

            $mail->setFrom('your-email@gmail.com', 'CRTVSHOTS');
            $mail->addAddress($user_email);

            $reset_link = "http://localhost/CRTV%20Shots/crtv-shots-website/backend/config/reset_password.php?token=$token";

            $mail->isHTML(true);
            $mail->Subject = "Password Reset Request";
            $mail->Body    = "<p>We received a request to reset your password.</p>
                              <p>Click the link below to reset your password:</p>
                              <p><a href='$reset_link'>$reset_link</a></p>
                              <p>This link expires in 1 hour.</p>";

            $mail->send();

            $message = "<div class='alert alert-success text-center'>
                            A password reset email has been sent to <strong>$user_email</strong>.
                        </div>";
        } catch (Exception $e) {
            $message = "<div class='alert alert-danger text-center'>
                            Could not send email. Mailer Error: {$mail->ErrorInfo}
                        </div>";
        }
    } else {
        $message = "<div class='alert alert-danger text-center'>
                        The email you entered is not registered. Please try again.
                    </div>";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Forgot Password</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container my-5">
    <h2 class="text-center mb-4">Forgot Password</h2>
    <?php if (!empty($message)) echo $message; ?>
    <form action="forgot_password.php" method="post">
        <div class="mb-3">
            <label class="form-label">Enter your registered Gmail</label>
            <input type="email" name="user_email" class="form-control" placeholder="Enter Gmail" required value="<?php echo $email_val; ?>">
        </div>
        <div class="d-grid mt-3">
            <input type="submit" name="forgot_password" class="btn btn-dark" value="Send Reset Link">
        </div>
    </form>
    <p class="text-center mt-3">
        Remembered your password? <a href="login.php" class="text-danger">Login</a>
    </p>
</div>
</body>
</html>
