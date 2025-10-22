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

$userId = $_SESSION['user_id'] ?? null;

if (!$userId) {
    echo json_encode(["success" => false, "message" => "Not authenticated"]);
    exit;
}

if (!isset($_POST['profile_picture_url'])) {
    echo json_encode(["success" => false, "message" => "Profile picture URL is required"]);
    exit;
}

$profilePictureUrl = trim($_POST['profile_picture_url']);

// Validate URL
if (!filter_var($profilePictureUrl, FILTER_VALIDATE_URL)) {
    echo json_encode(["success" => false, "message" => "Invalid URL format"]);
    exit;
}

// Update profile picture in database
$stmt = $con->prepare("UPDATE signup SET profile_picture = ? WHERE user_id = ?");
$stmt->bind_param("si", $profilePictureUrl, $userId);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Profile picture updated successfully",
        "profile_picture_url" => $profilePictureUrl
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to update profile picture"]);
}

$stmt->close();
$con->close();
?>
