<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed', 405);
}

// Ensure table exists
mysqli_query($con, "CREATE TABLE IF NOT EXISTS availability (
  date DATE PRIMARY KEY,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$onlyFuture = isset($_GET['future']) ? (int)$_GET['future'] : 1;

if ($onlyFuture) {
    $stmt = mysqli_prepare($con, "SELECT DATE_FORMAT(date, '%Y-%m-%d') AS d FROM availability WHERE is_available = 1 AND date >= CURDATE() ORDER BY date ASC");
} else {
    $stmt = mysqli_prepare($con, "SELECT DATE_FORMAT(date, '%Y-%m-%d') AS d FROM availability WHERE is_available = 1 ORDER BY date ASC");
}

if (!$stmt || !mysqli_stmt_execute($stmt)) {
    json_error('Failed to load availability');
}
$result = mysqli_stmt_get_result($stmt);
$dates = [];
while ($row = mysqli_fetch_assoc($result)) {
    $dates[] = $row['d'];
}

json_ok(['dates' => $dates]);
