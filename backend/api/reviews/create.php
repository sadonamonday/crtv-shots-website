<?php
require_once __DIR__ . '/../../utils/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method Not Allowed', 405);
}

// Accept form-data or JSON
$content = isset($_POST['message']) ? trim((string)$_POST['message']) : null; // map legacy field name to new column
$rating = isset($_POST['rating']) ? (int)$_POST['rating'] : null;

if ($content === null && $rating === null) {
    $data = json_input();
    $content = isset($data['message']) ? trim((string)$data['message']) : (isset($data['content']) ? trim((string)$data['content']) : '');
    $rating = isset($data['rating']) ? (int)$data['rating'] : 0;
}

if ($content === '' || !is_int($rating) || $rating < 1 || $rating > 5) {
    json_error('Please provide message and rating (1-5).', 422);
}

// Determine name from session if available
$name = 'Anonymous';
$userId = $_SESSION['user_id'] ?? null;
if ($userId) {
    if ($stmt = $con->prepare('SELECT user_firstname, user_surname FROM signup WHERE user_id = ?')) {
        $stmt->bind_param('i', $userId);
        if ($stmt->execute()) {
            $res = $stmt->get_result();
            if ($row = $res->fetch_assoc()) {
                $candidate = trim(($row['user_firstname'] ?? '') . ' ' . ($row['user_surname'] ?? ''));
                if ($candidate !== '') { $name = $candidate; }
            }
        }
    }
}

// Insert testimonial with new column name 'content'
if (!($stmt = $con->prepare('INSERT INTO testimonials (name, content, rating) VALUES (?, ?, ?)'))) {
    json_error('Failed to prepare statement.', 500);
}
$stmt->bind_param('ssi', $name, $content, $rating);
if (!$stmt->execute()) {
    json_error('Failed to save testimonial.', 500);
}

// Respond using legacy key 'message' for compatibility while storing in 'content'
json_ok(['id' => $stmt->insert_id, 'name' => $name, 'message' => $content, 'rating' => $rating], 201);
