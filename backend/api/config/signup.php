<?php
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
            $verify_link = "http://localhost:8000/backend/api/config/verify_email.php?token=$token";
            $mail = new PHPMailer(true);
            try {
                $mail->isSMTP();
                $mail->Host = 'smtp.gmail.com';
                $mail->SMTPAuth = true;
                $mail->Username = 'ngwenya1305@gmail.com';
                $mail->Password = 'ghsr bssh ztza ulid';
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port = 587;
                $mail->setFrom('your-email@gmail.com', 'CRTVSHOTS');
                $mail->addAddress($user_email, $user_firstname);
                $mail->isHTML(true);
                $mail->Subject = "Verify your email";
                $mail->Body = "<p>Hello $user_firstname,</p><p>Click below to verify your email:</p><p><a href='$verify_link'>Verify Email</a></p>";
                $mail->send();
                echo "<script>alert('Signup successful! Check your email to verify your account.'); window.location.href='http://localhost:5173/login';</script>";
                exit;
            } catch (Exception $e) {
                echo "<div class='alert alert-warning'>Signup successful, but email could not be sent: {$mail->ErrorInfo}</div>";
            }
        } else {
            $errors[] = "Signup failed, please try again.";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Sign Up</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
<style>
body { background: #f8f9fa; }
.form-control {
  transition: border-color 0.3s;
  border: 1px solid #ced4da;
}
.form-control.valid { border-color: #198754 !important; }  /* Green */
.form-control.invalid { border-color: #dc3545 !important; } /* Red */
.position-relative .fa-eye { cursor: pointer; }
#passwordStrength span {
  display: inline-block;
  width: 20%;
  height: 5px;
  margin: 2px;
  border-radius: 2px;
  background: #e0e0e0;
}
#passwordStrength span.active { background: #198754; }
</style>
</head>
<body>
<div class="container my-5 col-md-6">
  <h2 class="text-center mb-4 fw-bold">Create an Account</h2>

  <?php if(!empty($errors)): ?>
  <div class='alert alert-danger'>
  <?php 
  foreach($errors as $err) echo "$err<br>";
  if(!empty($username_suggestions)) echo "<strong>Try one:</strong> " . implode(', ', $username_suggestions);
  ?>
  </div>
  <?php endif; ?>

  <form id="signupForm" action="signup.php" method="post" novalidate>
    <div class="mb-3">
      <label class="form-label">First Name</label>
      <input type="text" class="form-control" name="user_firstname" id="user_firstname" required>
      <div id="firstnameFeedback" class="form-text text-danger"></div>
    </div>

    <div class="mb-3">
      <label class="form-label">Surname</label>
      <input type="text" class="form-control" name="user_surname" id="user_surname" required>
      <div id="surnameFeedback" class="form-text text-danger"></div>
    </div>

    <div class="mb-3">
      <label class="form-label">Username</label>
      <input type="text" class="form-control" name="user_username" id="user_username" required>
      <div id="usernameFeedback" class="form-text"></div>
    </div>

    <div class="mb-3">
      <label class="form-label">Email (Gmail only)</label>
      <input type="email" class="form-control" name="user_email" id="user_email" required>
      <div id="emailFeedback" class="form-text text-danger"></div>
      <small class="text-muted">Don’t have a Gmail? <a href="https://accounts.google.com/signup" target="_blank">Create one here</a></small>
    </div>

    <div class="mb-3 position-relative">
      <label class="form-label">Password</label>
      <input type="password" class="form-control pe-5" name="user_password" id="user_password" required>
      <i class="fa-solid fa-eye position-absolute top-50 end-0 translate-middle-y pe-3" id="togglePassword"></i>
      <div id="passwordFeedback" class="form-text text-danger"></div>
    </div>

    <div class="mb-3 position-relative">
      <label class="form-label">Confirm Password</label>
      <input type="password" class="form-control pe-5" name="conf_user_password" id="conf_user_password" required>
      <i class="fa-solid fa-eye position-absolute top-50 end-0 translate-middle-y pe-3" id="toggleConfirmPassword"></i>
      <div id="confirmFeedback" class="form-text text-danger"></div>
    </div>

    <div class="mb-3">
      <label class="form-label">Address</label>
      <input type="text" class="form-control" name="user_address" id="user_address" required>
    </div>

    <div class="mb-3">
      <label class="form-label">Contact</label>
      <input type="text" class="form-control" name="user_contact" id="user_contact" required>
      <div id="contactFeedback" class="form-text text-danger"></div>
    </div>

    <div class="d-grid mt-3">
      <button type="submit" name="signup" class="btn btn-primary">Sign Up</button>
    </div>

        <p class="mt-2 text-center">Already have an account? 
      <a href="http://localhost:5173/login" class="text-danger">Login</a>
    </p>
  </form>
</div>

<script>
// Show/hide password
function toggleVisibility(toggleId, inputId) {
  const toggle = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  toggle.addEventListener('click', () => {
    input.type = input.type === 'password' ? 'text' : 'password';
    toggle.classList.toggle('fa-eye-slash');
  });
}
toggleVisibility('togglePassword', 'user_password');
toggleVisibility('toggleConfirmPassword', 'conf_user_password');

// Live validation
function markField(input, valid) {
  input.classList.remove('valid','invalid');
  if(input.value.trim() !== '') input.classList.add(valid?'valid':'invalid');
}

// First name
document.getElementById('user_firstname').addEventListener('input', e=>{
  const valid = e.target.value.trim().length >= 2;
  markField(e.target, valid);
  document.getElementById('firstnameFeedback').textContent = valid?'':'At least 2 characters';
});

// Surname
document.getElementById('user_surname').addEventListener('input', e=>{
  const valid = e.target.value.trim().length >= 2;
  markField(e.target, valid);
  document.getElementById('surnameFeedback').textContent = valid?'':'At least 2 characters';
});

// Username AJAX
document.getElementById('user_username').addEventListener('input', e=>{
  const val = e.target.value.trim();
  const fb = document.getElementById('usernameFeedback');
  if(val.length<4){ markField(e.target,false); fb.textContent='At least 4 characters'; fb.className='form-text text-danger'; return; }
  fetch('check_username.php?username='+encodeURIComponent(val))
  .then(res=>res.json())
  .then(data=>{
    if(data.available){ markField(e.target,true); fb.textContent='✅ Username available'; fb.className='form-text text-success'; }
    else{ markField(e.target,false); fb.innerHTML='❌ Username taken. Try: '+data.suggestions.join(', '); fb.className='form-text text-danger'; }
  });
});

// Email AJAX check
document.getElementById('user_email').addEventListener('input', e=>{
  const val = e.target.value.trim();
  const fb = document.getElementById('emailFeedback');
  const valid = /^[\w.%+-]+@gmail\.com$/.test(val);
  markField(e.target, valid);
  if(!valid){ fb.textContent='Enter a valid Gmail address.'; return; }

  fetch('check_email.php?email='+encodeURIComponent(val))
  .then(res=>res.json())
  .then(data=>{
    if(data.available){ markField(e.target,true); fb.textContent=''; }
    else{ markField(e.target,false); fb.textContent='Email already exists'; }
  });
});

// Password strength
document.getElementById('user_password').addEventListener('input', e => {
    const val = e.target.value;
    const feedback = document.getElementById('passwordFeedback');
    const rules = [];

    if (val.length < 8) rules.push("at least 8 characters");
    if (!/[A-Z]/.test(val)) rules.push("1 uppercase letter");
    if (!/[0-9]/.test(val)) rules.push("1 number");
    if (!/[\W]/.test(val)) rules.push("1 special character");

    if (rules.length === 0) {
        feedback.textContent = "Password is strong.";
        feedback.classList.remove("text-danger");
        feedback.classList.add("text-success");
        e.target.classList.add("valid");
        e.target.classList.remove("invalid");
    } else {
        feedback.textContent = "Password must include: " + rules.join(", ");
        feedback.classList.remove("text-success");
        feedback.classList.add("text-danger");
        e.target.classList.add("invalid");
        e.target.classList.remove("valid");
    }
});

// Confirm password
const pass=document.getElementById('user_password');
const conf=document.getElementById('conf_user_password');
conf.addEventListener('input',()=>{
  const match=conf.value===pass.value && conf.value!==''; markField(conf,match);
  document.getElementById('confirmFeedback').textContent=match?'':'Passwords do not match.';
});

// Contact
document.getElementById('user_contact').addEventListener('input', e=>{
  const valid=/^(\+27|0)[0-9]{9}$/.test(e.target.value.trim());
  markField(e.target,valid);
  document.getElementById('contactFeedback').textContent=valid?'':'Invalid SA contact number';
});
</script>
</body>
</html>
