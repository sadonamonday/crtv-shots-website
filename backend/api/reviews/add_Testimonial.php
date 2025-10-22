<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';
session_start();


// Check login
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$user_id = $_SESSION['user_id'];

// Fetch user name
$stmt = $con->prepare("SELECT user_firstname, user_surname FROM signup WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    die("User not found.");
}

$full_name = trim($user['user_firstname'] . ' ' . $user['user_surname']);

$error = "";
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $message = trim($_POST["message"]);
    $rating = (int)$_POST["rating"];

    if (!empty($message) && $rating > 0) {
        $stmt = $con->prepare("INSERT INTO testimonials (name, message, rating) VALUES (?, ?, ?)");
        $stmt->bind_param("ssi", $full_name, $message, $rating);
        if ($stmt->execute()) {
            header("Location: http://localhost:5173/testimonials");
            exit;
        } else {
            $error = "Failed to save testimonial. Please try again.";
        }
    } else {
        $error = "Please enter a message and select a rating.";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Add Testimonial - CRTVSHOTS</title>
<style>
  body {
    font-family: 'Inter', sans-serif;
    background: linear-gradient(135deg, #1e2136ff, #1e2136ff);
    margin: 0;
    padding: 0;
    color: #fff;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    background-color: #1e2136ff;
    color: #fff;
    padding: 20px 40px;
    font-weight: bold;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 20px;
  }

  header .logo {
    width: 120px;
    height: auto;
  }

  header h1 {
    font-size: 1.6rem;
    margin: 0;
    letter-spacing: 1px;
  }

  footer {
    background-color: #1e2136ff;
    color: #fff;
    text-align: center;
    padding: 15px 0;
    font-size: 0.9rem;
    margin-top: auto;
    opacity: 0.85;
  }

  .container {
    max-width: 900px;
    background: #fff;
    color: #000;
    margin: 40px auto;
    padding: 80px;
    border-radius: 18px;
    box-shadow: 0 8px 35px rgba(0,0,0,0.4);
  }

  h2 {
    text-align: center;
    color: #111;
    margin-bottom: 25px;
    font-size: 1.8rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  textarea, select {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 1rem;
  }

  textarea {
    resize: vertical;
    min-height: 120px;
  }

  label {
    font-weight: 600;
    color: #000;
  }

  button {
    background: #000;
    color: #fff;
    border: none;
    padding: 14px;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.3s ease;
  }

  button:hover {
    background: #333;
  }

  .error {
    color: red;
    text-align: center;
    font-weight: 500;
  }

  #charCount {
    font-size: 0.85rem;
    color: #555;
    text-align: right;
  }
</style>
</head>
<body>

<header>
  <img src="../Gallery/logo.png" alt="CRTVSHOTS Logo" class="logo" />
  <h1>CRTVSHOTS</h1>
</header>

<div class="container">
  <h2>Add Testimonial</h2>

  <?php if (!empty($error)): ?>
    <p class="error"><?= htmlspecialchars($error) ?></p>
  <?php endif; ?>

  <form method="post">
    <label for="message">Your Testimonial:</label>
    <textarea id="message" name="message" maxlength="200" required></textarea>
    <p id="charCount">0 / 200 characters</p>

    <label for="rating">Rating:</label>
    <select id="rating" name="rating" required>
      <option value="">Select rating</option>
      <option value="5">★★★★★ (5 stars)</option>
      <option value="4">★★★★☆ (4 stars)</option>
      <option value="3">★★★☆☆ (3 stars)</option>
      <option value="2">★★☆☆☆ (2 stars)</option>
      <option value="1">★☆☆☆☆ (1 star)</option>
    </select>

    <button type="submit">Submit Testimonial</button>
  </form>
</div>

<footer>
  © <?= date("Y") ?> CRTVSHOTS. All rights reserved.
</footer>

<script>
  const textarea = document.getElementById("message");
  const counter = document.getElementById("charCount");

  textarea.addEventListener("input", () => {
    counter.textContent = `${textarea.value.length} / 200 characters`;
  });
</script>

</body>
</html>


