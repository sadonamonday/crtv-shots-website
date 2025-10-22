<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';

// GET service availability
// Query params: service_id (required), start_date?, end_date?
// Returns: [{date, start_time, end_time, capacity, notes}]

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed', 405);
}

$service_id = isset($_GET['service_id']) ? (int)$_GET['service_id'] : 0;
if ($service_id <= 0) {
    json_error('service_id is required', 400);
}

$start_date = isset($_GET['start_date']) ? trim($_GET['start_date']) : '';
$end_date = isset($_GET['end_date']) ? trim($_GET['end_date']) : '';

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

$where = ['service_id = ?'];
$params = [$service_id];
$types = 'i';

if ($start_date !== '') {
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $start_date)) {
        json_error('start_date must be YYYY-MM-DD', 400);
    }
    $where[] = 'date >= ?';
    $params[] = $start_date;
    $types .= 's';
}
if ($end_date !== '') {
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $end_date)) {
        json_error('end_date must be YYYY-MM-DD', 400);
    }
    $where[] = 'date <= ?';
    $params[] = $end_date;
    $types .= 's';
}

$sql = 'SELECT DATE_FORMAT(date, "%Y-%m-%d") AS date, DATE_FORMAT(start_time, "%H:%i:%s") AS start_time, DATE_FORMAT(end_time, "%H:%i:%s") AS end_time, capacity, notes FROM availability WHERE ' . implode(' AND ', $where) . ' ORDER BY date ASC, start_time ASC';
$stmt = mysqli_prepare($con, $sql);
if (!$stmt) {
    json_error('Failed to prepare query', 500);
}
mysqli_stmt_bind_param($stmt, $types, ...$params);
if (!mysqli_stmt_execute($stmt)) {
    json_error('Failed to query availability', 500);
}
$res = mysqli_stmt_get_result($stmt);
$list = [];
while ($row = mysqli_fetch_assoc($res)) {
    $list[] = [
        'date' => $row['date'],
        'start_time' => $row['start_time'],
        'end_time' => $row['end_time'],
        'capacity' => isset($row['capacity']) ? (int)$row['capacity'] : 1,
        'notes' => $row['notes'] ?? null,
    ];
}

json_ok(['service_id' => $service_id, 'availability' => $list]);
