<?php
session_start();
include __DIR__ . "/database.php";

// Make sure user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$user_id = $_SESSION['user_id'];

// Fetch user's name from signup table
$stmt = $con->prepare("SELECT user_firstname, user_surname FROM signup WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    die("User not found in database.");
}

$full_name = trim($user['user_firstname'] . ' ' . $user['user_surname']);

// Handle form submission
$error = '';
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Map form field 'message' to new column 'content'
    $content = trim($_POST["message"]);
    $rating = (int)$_POST["rating"];

    if (!empty($content) && $rating > 0) {
        $stmt = $con->prepare("INSERT INTO testimonials (name, content, rating) VALUES (?, ?, ?)");
        $stmt->bind_param("ssi", $full_name, $content, $rating);

        if ($stmt->execute()) {
            header("Location: testimonials.php");
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
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Add Testimonial - CRTVSHOTS</title>
<style>
  body { font-family: Arial, sans-serif; background: #111; margin: 0; padding: 0; }
  .container { max-width: 500px; background: #fff; margin: 50px auto; padding: 30px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
  h2 { text-align: center; margin-bottom: 20px; }
  form { display: flex; flex-direction: column; gap: 15px; }
  textarea { resize: vertical; min-height: 100px; padding: 10px; font-size: 1rem; border-radius: 6px; border: 1px solid #ccc; }
  select { padding: 10px; font-size: 1rem; border-radius: 6px; border: 1px solid #ccc; }
  button { background: black; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold; }
  button:hover { background: #222; }
  .error { color: red; text-align: center; margin-bottom: 10px; }

  label {
  color: #000;
  font-weight: 600;
}
</style>
</head>
<body>

<div class="container">
  <h2>Add Testimonial</h2>

  <?php if (!empty($error)): ?>
    <p class="error"><?= htmlspecialchars($error) ?></p>
  <?php endif; ?>

  <form method="post">
    <label for="message">Your Testimonial:</label>
<textarea name="message" id="message" rows="5" maxlength="200" required></textarea>
<p id="charCount" style="color:#555; font-size:14px;">0 / 200 characters</p>

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
  <script>
const textarea = document.getElementById("message");
const counter = document.getElementById("charCount");

textarea.addEventListener("input", () => {
  counter.textContent = `${textarea.value.length} / 200 characters`;
});
</script>
</div>

</body>
</html>


<?php
;

// Show Footer
showFooter();
?>