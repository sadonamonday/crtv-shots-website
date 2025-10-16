<?php
session_start();

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

include __DIR__ . "/database.php";

// ✅ 1. Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "User not logged in"]);
    exit;
}

$user_id = $_SESSION['user_id'];

// ✅ 2. Fetch user's full name
$stmt = $con->prepare("SELECT user_firstname, user_surname FROM signup WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    echo json_encode(["error" => "User not found in database"]);
    exit;
}

$full_name = trim($user['user_firstname'] . ' ' . $user['user_surname']);

// ✅ 3. Handle POST requests
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $message = trim($_POST["message"] ?? '');
    $rating = (int)($_POST["rating"] ?? 0);

    if ($message && $rating > 0) {
        $stmt = $con->prepare("INSERT INTO testimonials (name, message, rating) VALUES (?, ?, ?)");
        $stmt->bind_param("ssi", $full_name, $message, $rating);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Testimonial added successfully"]);
        } else {
            echo json_encode(["error" => "Database insert failed"]);
        }
    } else {
        echo json_encode(["error" => "Please provide a message and a rating"]);
    }
} else {
    echo json_encode(["error" => "Invalid request method"]);
}
