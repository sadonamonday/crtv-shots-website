<?php
session_start();
include __DIR__ . "/database.php";

require __DIR__ . "/../../../vendor/autoload.php"; 
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$errors = [];
$username_suggestions = [];

// Retain values on error
$firstname_val = $surname_val = $username_val = $email_val = $address_val = $contact_val = "";

if (isset($_POST['signup'])) {
    $user_firstname = trim($_POST['user_firstname']);
    $user_surname = trim($_POST['user_surname']);
    $user_username = trim($_POST['user_username']);
    $user_email = trim($_POST['user_email']);
    $user_password = $_POST['user_password'];
    $conf_user_password = $_POST['conf_user_password'];
    $user_address = trim($_POST['user_address']);
    $user_contact = str_replace(' ', '', $_POST['user_contact']);

    // Preserve values
    $firstname_val = htmlspecialchars($user_firstname);
    $surname_val = htmlspecialchars($user_surname);
    $username_val = htmlspecialchars($user_username);
    $email_val = htmlspecialchars($user_email);
    $address_val = htmlspecialchars($user_address);
    $contact_val = htmlspecialchars($user_contact);

    // ---------- VALIDATIONS ----------
    if (empty($user_firstname) || !preg_match("/^[A-Za-z ]{2,50}$/", $user_firstname)) {
        $errors['firstname'] = "First name must be 2–50 letters only.";
    }

    if (empty($user_surname) || !preg_match("/^[A-Za-z ]{2,50}$/", $user_surname)) {
        $errors['surname'] = "Surname must be 2–50 letters only.";
    }

    if (!filter_var($user_email, FILTER_VALIDATE_EMAIL) || !str_ends_with($user_email, '@gmail.com')) {
        $errors['email'] = "Please enter a valid Gmail address.";
    }

    if (!preg_match('/^(\+27|0)[0-9]{9}$/', $user_contact)) {
        $errors['contact'] = "Enter a valid SA contact number (e.g., 0612345678 or +27612345678).";
    }

    if ($user_password !== $conf_user_password) {
        $errors['password_match'] = "Passwords do not match.";
    } else {
        $pwd_errors = [];
        if (strlen($user_password) < 8) $pwd_errors[] = "at least 8 characters";
        if (!preg_match('/[A-Z]/', $user_password)) $pwd_errors[] = "an uppercase letter";
        if (!preg_match('/[0-9]/', $user_password)) $pwd_errors[] = "a number";
        if (!preg_match('/[\W]/', $user_password)) $pwd_errors[] = "a special character";
        if ($pwd_errors) $errors['password_strength'] = "Password must contain ".implode(", ", $pwd_errors).".";
    }

    if (empty($user_address)) $errors['address'] = "Address is required.";

    // Check uniqueness
    $stmt = $con->prepare("SELECT user_id FROM signup WHERE user_username=?");
    $stmt->bind_param("s",$user_username);
    $stmt->execute();
    if ($stmt->get_result()->num_rows>0) {
        $errors['username'] = "Username already exists.";
        for ($i=0;$i<5;$i++) {
            $suggest = $user_username.rand(10,99);
            $r = $con->prepare("SELECT user_id FROM signup WHERE user_username=?");
            $r->bind_param("s",$suggest);
            $r->execute();
            if ($r->get_result()->num_rows==0) $username_suggestions[]=$suggest;
        }
    }
    $stmt->close();

    $stmt = $con->prepare("SELECT user_id FROM signup WHERE user_email=?");
    $stmt->bind_param("s",$user_email);
    $stmt->execute();
    if ($stmt->get_result()->num_rows>0) $errors['email_exists'] = "Email already registered.";
    $stmt->close();

    // ---------- INSERT INTO DATABASE ----------
    if (empty($errors)) {
        $hash_password = password_hash($user_password, PASSWORD_DEFAULT);
        $token = bin2hex(random_bytes(32));
        $expires = date("Y-m-d H:i:s", strtotime("+1 day"));
        if (preg_match('/^0[0-9]{9}$/', $user_contact)) $user_contact = '+27'.substr($user_contact,1);

        $insert = $con->prepare("INSERT INTO signup (user_firstname,user_surname,user_username,user_email,user_password,user_ip,user_address,user_contact,verification_token,verification_token_expires_at) VALUES (?,?,?,?,?,?,?,?,?,?)");
        $user_ip = $_SERVER['REMOTE_ADDR'];
        $insert->bind_param("ssssssssss",$user_firstname,$user_surname,$user_username,$user_email,$hash_password,$user_ip,$user_address,$user_contact,$token,$expires);

        if ($insert->execute()) {
            $verify_link = "http://localhost/CRTV%20Shots/crtv-shots-website/backend/config/verify_email.php?token=$token";
            $mail = new PHPMailer(true);
            try {
                $mail->isSMTP();
                $mail->Host = 'smtp.gmail.com';
                $mail->SMTPAuth = true;
                $mail->Username = 'ngwenya1305@gmail.com';
                $mail->Password = 'ghsr bssh ztza ulid';
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port = 587;
                $mail->setFrom('your-email@gmail.com','CRTVSHOTS');
                $mail->addAddress($user_email, $user_firstname);
                $mail->isHTML(true);
                $mail->Subject = "Verify your email";
                $mail->Body = "<p>Hello $user_firstname,</p><p>Click to verify your email:</p><p><a href='$verify_link'>Verify Email</a></p>";
                $mail->send();
                echo "<script>alert('Signup successful! Check your email to verify.'); window.location.href='../../frontend/client/index.html';</script>";
                exit;
            } catch (Exception $e) {
                echo "<div class='alert alert-warning'>Signup successful, but email could not be sent: {$mail->ErrorInfo}</div>";
            }
        } else {
            $errors['insert'] = "Signup failed, please try again.";
        }
    }
}
?>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Sign Up</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
<style>.position-relative .fa-eye{cursor:pointer;}</style>
</head>
<body>
<div class="container my-5">
<h2 class="text-center mb-4">Sign Up</h2>

<?php
if(!empty($errors)){
    echo "<div class='alert alert-danger'>";
    foreach($errors as $err) echo "$err<br>";
    if(!empty($username_suggestions)) echo "Try one: ".implode(', ', $username_suggestions);
    echo "</div>";
}
?>

<form action="signup.php" method="post">
    <div class="mb-3">
        <label class="form-label">First Name</label>
        <input type="text" class="form-control" name="user_firstname" value="<?php echo $firstname_val; ?>" required>
    </div>
    <div class="mb-3">
        <label class="form-label">Surname</label>
        <input type="text" class="form-control" name="user_surname" value="<?php echo $surname_val; ?>" required>
    </div>
    <div class="mb-3">
        <label class="form-label">Username</label>
        <input type="text" class="form-control" name="user_username" value="<?php echo $username_val; ?>" required>
    </div>
    <div class="mb-3">
        <label class="form-label">Email (Gmail only)</label>
        <input type="email" class="form-control" name="user_email" value="<?php echo $email_val; ?>" required>
    </div>
    <div class="mb-3 position-relative">
        <label class="form-label">Password</label>
        <input type="password" class="form-control pe-5" name="user_password" id="user_password" required>
        <i class="fa-solid fa-eye position-absolute top-50 end-0 translate-middle-y pe-3" id="togglePassword"></i>
    </div>
    <div class="mb-3 position-relative">
        <label class="form-label">Confirm Password</label>
        <input type="password" class="form-control pe-5" name="conf_user_password" id="conf_user_password" required>
        <i class="fa-solid fa-eye position-absolute top-50 end-0 translate-middle-y pe-3" id="toggleConfirmPassword"></i>
    </div>
    <div class="mb-3">
        <label class="form-label">Address</label>
        <input type="text" class="form-control" name="user_address" value="<?php echo $address_val; ?>" required>
    </div>
    <div class="mb-3">
        <label class="form-label">Contact</label>
        <input type="text" class="form-control" name="user_contact" value="<?php echo $contact_val; ?>" required>
    </div>
    <div class="d-grid mt-3">
        <input type="submit" name="signup" class="btn btn-dark" value="Sign Up">
    </div>
    <p class="mt-2 text-center">Already have an account? <a href="login.php" class="text-danger">Login</a></p>
</form>
</div>

<script>
// Toggle password visibility
const togglePassword=document.getElementById('togglePassword');
const pass=document.getElementById('user_password');
togglePassword.addEventListener('click',()=>{pass.type=pass.type==='password'?'text':'password';togglePassword.classList.toggle('fa-eye-slash');});

const toggleConfirm=document.getElementById('toggleConfirmPassword');
const conf=document.getElementById('conf_user_password');
toggleConfirm.addEventListener('click',()=>{conf.type=conf.type==='password'?'text':'password';toggleConfirm.classList.toggle('fa-eye-slash');});
</script>
</body>
</html>
