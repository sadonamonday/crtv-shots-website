<?php
require_once __DIR__ . '/../../utils/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method Not Allowed', 405);
}

// Accept form-data or JSON
$message = isset($_POST['message']) ? trim((string)$_POST['message']) : null;
$rating = isset($_POST['rating']) ? (int)$_POST['rating'] : null;

if ($message === null && $rating === null) {
    $data = json_input();
    $message = isset($data['message']) ? trim((string)$data['message']) : '';
    $rating = isset($data['rating']) ? (int)$data['rating'] : 0;
}

if ($message === '' || !is_int($rating) || $rating < 1 || $rating > 5) {
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

// Insert testimonial
if (!($stmt = $con->prepare('INSERT INTO testimonials (name, message, rating) VALUES (?, ?, ?)'))) {
    json_error('Failed to prepare statement.', 500);
}
$stmt->bind_param('ssi', $name, $message, $rating);
if (!$stmt->execute()) {
    json_error('Failed to save testimonial.', 500);
}

json_ok(['id' => $stmt->insert_id, 'name' => $name, 'message' => $message, 'rating' => $rating], 201);
