<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';

// POST to upsert availability for a service
// Body: { service_id: number, slots: [ { date: YYYY-MM-DD, start_time: HH:MM or HH:MM:SS, end_time: HH:MM or HH:MM:SS, capacity?: number, notes?: string } ] }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

$body = json_input();
$service_id = isset($body['service_id']) ? (int)$body['service_id'] : 0;
$slots = $body['slots'] ?? [];
if ($service_id <= 0) { json_error('service_id is required', 400); }
if (!is_array($slots)) { json_error('slots must be an array', 400); }

// Ensure availability table exists
mysqli_query($con, "CREATE TABLE IF NOT EXISTS availability (
  service_id INT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INT NOT NULL DEFAULT 1,
  notes VARCHAR(255) NULL,
  PRIMARY KEY (service_id, date, start_time),
  INDEX idx_service_date (service_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$inserted = 0;
$updated = 0;

foreach ($slots as $slot) {
    if (!is_array($slot)) continue;
    $date = isset($slot['date']) ? trim((string)$slot['date']) : '';
    $start_time = isset($slot['start_time']) ? trim((string)$slot['start_time']) : '';
    $end_time = isset($slot['end_time']) ? trim((string)$slot['end_time']) : '';
    $capacity = isset($slot['capacity']) && is_numeric($slot['capacity']) ? (int)$slot['capacity'] : 1;
    $notes = isset($slot['notes']) ? trim((string)$slot['notes']) : null;

    if ($date === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) { continue; }
    // Normalize time to HH:MM:SS
    $normalizeTime = function($t) {
        if (preg_match('/^\d{2}:\d{2}:\d{2}$/', $t)) return $t;
        if (preg_match('/^\d{2}:\d{2}$/', $t)) return $t . ':00';
        return '';
    };
    $start_time = $normalizeTime($start_time);
    $end_time = $normalizeTime($end_time);
    if ($start_time === '' || $end_time === '') { continue; }

    // Upsert: try update, if 0 rows then insert
    $stmtU = mysqli_prepare($con, 'UPDATE availability SET end_time = ?, capacity = ?, notes = ? WHERE service_id = ? AND date = ? AND start_time = ?');
    if ($stmtU) {
        mysqli_stmt_bind_param($stmtU, 'sissss', $end_time, $capacity, $notes, $service_id, $date, $start_time);
        mysqli_stmt_execute($stmtU);
        $affected = mysqli_stmt_affected_rows($stmtU);
        if ($affected > 0) { $updated++; continue; }
    }

    $stmtI = mysqli_prepare($con, 'INSERT INTO availability (service_id, date, start_time, end_time, capacity, notes) VALUES (?, ?, ?, ?, ?, ?)');
    if (!$stmtI) { continue; }
    mysqli_stmt_bind_param($stmtI, 'isssis', $service_id, $date, $start_time, $end_time, $capacity, $notes);
    if (mysqli_stmt_execute($stmtI)) { $inserted++; }
}

json_ok(['service_id' => $service_id, 'inserted' => $inserted, 'updated' => $updated]);
