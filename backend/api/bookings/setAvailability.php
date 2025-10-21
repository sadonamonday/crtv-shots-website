<?php
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

// Ensure table exists
mysqli_query($con, "CREATE TABLE IF NOT EXISTS availability (
  date DATE PRIMARY KEY,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Strategy: replace full set. Mark all existing rows as unavailable, then upsert new dates as available
// More efficient: delete all and insert new.
if (!mysqli_query($con, "DELETE FROM availability")) {
    json_error('Failed to reset availability');
}

if (!empty($dates)) {
    $values = [];
    foreach ($dates as $d) {
        $d_esc = mysqli_real_escape_string($con, $d);
        $values[] = "('{$d_esc}', 1)";
    }
    $sql = "INSERT INTO availability (date, is_available) VALUES " . implode(',', $values);
    if (!mysqli_query($con, $sql)) {
        json_error('Failed to save availability');
    }
}

json_ok(['saved' => count($dates)]);
