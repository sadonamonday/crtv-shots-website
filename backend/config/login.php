<?php
session_start();
include __DIR__ . "/database.php";

$error = "";

if (isset($_POST['login'])) {
    $email = trim($_POST['user_email']);
    $password = $_POST['user_password'];

    $stmt = $con->prepare("SELECT * FROM signup WHERE user_email=?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();

    if ($user && password_verify($password, $user['user_password'])) {
        if ($user['email_verified'] == 1) {
            $_SESSION['user_id'] = $user['user_id'];
            header("Location: ../../frontend/client/index.html");
            exit;
        } else {
            $error = "Please verify your email before logging in.";
        }
    } else {
        $error = "Invalid email or password.";
    }
}
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Login</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
</head>
<body class="container my-5">
<h2>Login</h2>

<?php if($error) echo "<div class='alert alert-danger'>$error</div>"; ?>

<form method="post">
  <div class="mb-2 position-relative">
      <input class="form-control" type="email" name="user_email" placeholder="Email" required>
  </div>
  <div class="mb-2 position-relative">
      <input class="form-control pe-5" type="password" name="user_password" id="user_password" placeholder="Password" required>
      <i class="fa-solid fa-eye position-absolute top-50 end-0 translate-middle-y pe-3" id="togglePassword" style="cursor:pointer;"></i>
  </div>
  <button class="btn btn-dark" name="login">Login</button>
</form>

<p class="mt-3"><a href="forgot_password.php">Forgot Password?</a></p>
<p class="mt-2">Don't have an account? <a href="signup.php">Sign up</a></p>

<script>
// Toggle password visibility
const togglePassword = document.getElementById('togglePassword');
const passInput = document.getElementById('user_password');
togglePassword.addEventListener('click', () => {
    passInput.type = passInput.type === 'password' ? 'text' : 'password';
    togglePassword.classList.toggle('fa-eye-slash');
});
</script>
</body>
</html>
