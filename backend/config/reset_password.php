<?php
session_start();
include __DIR__ . "/database.php";

$error = "";
$token_valid = false;
$confirm_password_val = "";

// Validate token
if (isset($_GET['token'])) {
    $token = $_GET['token'];
    $token_hash = hash("sha256", $token);

    $query = "SELECT * FROM signup WHERE reset_token_hash=? AND reset_token_expires_at > NOW()";
    $stmt = mysqli_prepare($con, $query);
    mysqli_stmt_bind_param($stmt, "s", $token_hash);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    if (mysqli_num_rows($result) > 0) {
        $token_valid = true;
        $user = mysqli_fetch_assoc($result);
        $current_hash = $user['user_password']; // current password hash
    } else {
        $error = "Invalid or expired password reset link.";
    }
} else {
    $error = "No token provided.";
}

// Handle password reset
if (isset($_POST['reset_password']) && isset($_GET['token'])) {
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];
    $token_hash = hash("sha256", $_GET['token']);

    if ($password !== $confirm_password) {
        $error = "Passwords do not match.";
        $confirm_password_val = htmlspecialchars($confirm_password);
    } elseif (isset($current_hash) && password_verify($password, $current_hash)) {
        $error = "New password cannot be the same as the old password.";
    } elseif (strlen($password) < 8 || !preg_match('/[0-9]/',$password) || !preg_match('/[A-Z]/',$password) || !preg_match('/[\W]/',$password)) {
        $error = "Password must be at least 8 characters long, include an uppercase letter, a number, and a special character.";
    } else {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $update = "UPDATE signup SET user_password=?, reset_token_hash=NULL, reset_token_expires_at=NULL WHERE reset_token_hash=?";
        $stmt = mysqli_prepare($con, $update);
        mysqli_stmt_bind_param($stmt, "ss", $hash, $token_hash);

        if (mysqli_stmt_execute($stmt)) {
            echo "<script>alert('Password reset successful! You can now log in.'); window.location.href='login.php';</script>";
            exit();
        } else {
            $error = "Failed to reset password. Please try again later.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Reset Password</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
</head>
<body>
<div class="container my-5">
    <h2 class="text-center mb-4">Reset Password</h2>

    <?php if (!empty($error)) echo "<div class='alert alert-danger text-center'>$error</div>"; ?>

    <?php if ($token_valid): ?>
    <form method="post">
        <div class="mb-3 position-relative">
            <input type="password" class="form-control pe-5" name="password" id="password" placeholder="New Password" required>
            <i class="fa-solid fa-eye position-absolute top-50 end-0 translate-middle-y pe-3" id="toggleNewPassword" style="cursor:pointer;"></i>
        </div>
        <div class="mb-3 position-relative">
            <input type="password" class="form-control pe-5" name="confirm_password" id="confirm_password" placeholder="Confirm New Password" required value="<?php echo $confirm_password_val; ?>">
            <i class="fa-solid fa-eye position-absolute top-50 end-0 translate-middle-y pe-3" id="toggleConfirmPassword" style="cursor:pointer;"></i>
        </div>
        <div class="d-grid">
            <input type="submit" name="reset_password" value="Reset Password" class="btn btn-dark">
        </div>
    </form>
    <?php endif; ?>
</div>

<script>
// Toggle new password
const toggleNew = document.getElementById('toggleNewPassword');
const newPass = document.getElementById('password');
toggleNew.addEventListener('click', () => {
    newPass.type = newPass.type === 'password' ? 'text' : 'password';
    toggleNew.classList.toggle('fa-eye-slash');
});

// Toggle confirm password
const toggleConfirm = document.getElementById('toggleConfirmPassword');
const confirmPass = document.getElementById('confirm_password');
toggleConfirm.addEventListener('click', () => {
    confirmPass.type = confirmPass.type === 'password' ? 'text' : 'password';
    toggleConfirm.classList.toggle('fa-eye-slash');
});
</script>
</body>
</html>
