<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

// Allow anyone to act as admin: no authorization required

$body = json_input();
$dates = $body['dates'] ?? [];
if (!is_array($dates)) $dates = [];

// Normalize incoming dates to YYYY-MM-DD and filter invalid
$normalized = [];
foreach ($dates as $d) {
    $d = trim((string)$d);
    if ($d === '') continue;
    // Accept formats like YYYY-MM-DD only
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $d)) {
        $normalized[$d] = true; // use assoc to dedupe
    }
}
$dates = array_keys($normalized);

// Drop and recreate the table to ensure clean structure
mysqli_query($con, "DROP TABLE IF EXISTS availability");
mysqli_query($con, "CREATE TABLE availability (
  date DATE PRIMARY KEY,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Strategy: replace full set. Mark all existing rows as unavailable, then upsert new dates as available
// More efficient: delete all and insert new.
if (!mysqli_query($con, "DELETE FROM availability")) {
    json_error('Failed to reset availability: ' . mysqli_error($con));
}

$saved_count = 0;
if (!empty($dates)) {
    // Use prepared statement for better security
    $stmt = mysqli_prepare($con, "INSERT INTO availability (date, is_available) VALUES (?, 1)");
    if (!$stmt) {
        json_error('Failed to prepare statement: ' . mysqli_error($con));
    }
    
    foreach ($dates as $d) {
        mysqli_stmt_bind_param($stmt, 's', $d);
        if (mysqli_stmt_execute($stmt)) {
            $saved_count++;
        } else {
            error_log("Failed to save date $d: " . mysqli_stmt_error($stmt));
        }
    }
    mysqli_stmt_close($stmt);
}

// Log the operation for debugging
error_log("Availability update: Saved $saved_count out of " . count($dates) . " dates");

json_ok(['saved' => $saved_count, 'total' => count($dates)]);
