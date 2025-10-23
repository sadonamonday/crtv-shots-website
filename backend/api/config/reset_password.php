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
            echo "<script>alert('Password reset successful! You can now log in.'); window.location.href='http://localhost:5173/login';</script>";
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
<style>
.valid { border-color: #198754 !important; }   /* green border */
.invalid { border-color: #dc3545 !important; } /* red border */
.form-text { font-size: 0.9rem; }
</style>
</head>
<body>
<div class="container my-5">
    <h2 class="text-center mb-4">Reset Password</h2>

    <?php if (!empty($error)) echo "<div class='alert alert-danger text-center'>$error</div>"; ?>

    <?php if ($token_valid): ?>
    <form method="post" novalidate>
        <!-- New password input -->
        <div class="mb-3 position-relative">
            <input type="password" class="form-control pe-5" name="password" id="password" placeholder="New Password" required>
            <i class="fa-solid fa-eye position-absolute top-50 end-0 translate-middle-y pe-3" id="toggleNewPassword" style="cursor:pointer;"></i>
            <small id="passwordFeedback" class="form-text"></small>
        </div>

        <!-- Confirm password input -->
        <div class="mb-3 position-relative">
            <input type="password" class="form-control pe-5" name="confirm_password" id="confirm_password" placeholder="Confirm New Password" required value="<?php echo $confirm_password_val; ?>">
            <i class="fa-solid fa-eye position-absolute top-50 end-0 translate-middle-y pe-3" id="toggleConfirmPassword" style="cursor:pointer;"></i>
            <small id="confirmFeedback" class="form-text"></small>
        </div>

        <div class="d-grid">
            <input type="submit" name="reset_password" value="Reset Password" class="btn btn-primary">
        </div>
    </form>
    <?php endif; ?>
</div>

<script>
// Toggle password visibility
function toggleVisibility(toggleId, inputId) {
  const toggle = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  toggle.addEventListener('click', () => {
    input.type = input.type === 'password' ? 'text' : 'password';
    toggle.classList.toggle('fa-eye-slash');
  });
}
toggleVisibility('toggleNewPassword', 'password');
toggleVisibility('toggleConfirmPassword', 'confirm_password');

// Helper: mark valid/invalid fields
function markField(input, valid) {
  input.classList.remove('valid', 'invalid');
  if (input.value.trim() !== '') input.classList.add(valid ? 'valid' : 'invalid');
}

// Password validation (live)
const pass = document.getElementById('password');
const passFeedback = document.getElementById('passwordFeedback');
pass.addEventListener('input', e => {
  const val = e.target.value;
  const rules = [];

  if (val.length < 8) rules.push("at least 8 characters");
  if (!/[A-Z]/.test(val)) rules.push("1 uppercase letter");
  if (!/[0-9]/.test(val)) rules.push("1 number");
  if (!/[\W]/.test(val)) rules.push("1 special character");

  if (rules.length === 0) {
    passFeedback.textContent = "Password is strong.";
    passFeedback.classList.remove("text-danger");
    passFeedback.classList.add("text-success");
    markField(pass, true);
  } else {
    passFeedback.textContent = "Must include: " + rules.join(", ");
    passFeedback.classList.remove("text-success");
    passFeedback.classList.add("text-danger");
    markField(pass, false);
  }
});

// Confirm password validation (live)
const conf = document.getElementById('confirm_password');
const confFeedback = document.getElementById('confirmFeedback');
conf.addEventListener('input', () => {
  const match = conf.value === pass.value && conf.value !== '';
  markField(conf, match);
  confFeedback.textContent = match ? "Passwords match." : "Passwords do not match.";
  confFeedback.classList.toggle("text-success", match);
  confFeedback.classList.toggle("text-danger", !match);
});
</script>
</body>
</html>
