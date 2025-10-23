<?php
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

// Check database connection
if (!$con) {
    json_error('Database connection failed: ' . mysqli_connect_error(), 500);
}

$body = json_input();

$customer_name = trim($body['name'] ?? '');
$customer_email = trim($body['email'] ?? '');
$customer_phone = trim($body['phone'] ?? '');
$service = trim($body['service'] ?? '');
$date = trim($body['date'] ?? '');
$time = trim($body['time'] ?? '');
$notes = trim($body['notes'] ?? '');
$amount = (float)($body['amount'] ?? 0);
$payment_option = trim($body['paymentOption'] ?? '');
$user_id = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;

if ($customer_name === '' || $service === '' || $date === '') {
    json_error('Missing required fields: name, service, date');
}

// Enforce availability: a booking is allowed only if the date is explicitly marked available by admin
// Ensure availability table exists (no-op if already there)
mysqli_query($con, "CREATE TABLE IF NOT EXISTS availability (
  date DATE PRIMARY KEY,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Require the selected date to be present with is_available = 1
$stmtAvail = mysqli_prepare($con, "SELECT 1 FROM availability WHERE date = ? AND is_available = 1 LIMIT 1");
if ($stmtAvail) {
    mysqli_stmt_bind_param($stmtAvail, 's', $date);
    mysqli_stmt_execute($stmtAvail);
    $r = mysqli_stmt_get_result($stmtAvail);
    if (!$r || mysqli_num_rows($r) === 0) {
        json_error('Selected date is not available. Please contact admin to set availability.', 409);
    }
    mysqli_stmt_close($stmtAvail);
} else {
    // If preparing the statement failed for some reason, fail safe
    json_error('Failed to validate availability: ' . mysqli_error($con));
}

// Ensure bookings table exists (idempotent)
$createTable = mysqli_query($con, "CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) DEFAULT NULL,
  customer_phone VARCHAR(64) DEFAULT NULL,
  service VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(32) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  amount DECIMAL(10,2) DEFAULT 0,
  payment_option VARCHAR(16) DEFAULT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

if (!$createTable) {
    json_error('Failed to create bookings table: ' . mysqli_error($con));
}

// Check if user_id column exists, if not, insert without it
$check_column = mysqli_query($con, "SHOW COLUMNS FROM bookings LIKE 'user_id'");
if (!$check_column) {
    json_error('Failed to check table structure: ' . mysqli_error($con));
}

if (mysqli_num_rows($check_column) > 0) {
    $stmt = mysqli_prepare($con, "INSERT INTO bookings (user_id, customer_name, customer_email, customer_phone, service, date, time, notes, amount, payment_option, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')");
    if (!$stmt) json_error('Failed to prepare statement: ' . mysqli_error($con));
    mysqli_stmt_bind_param($stmt, 'issssssdss', $user_id, $customer_name, $customer_email, $customer_phone, $service, $date, $time, $notes, $amount, $payment_option);
} else {
    $stmt = mysqli_prepare($con, "INSERT INTO bookings (customer_name, customer_email, customer_phone, service, date, time, notes, amount, payment_option, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')");
    if (!$stmt) json_error('Failed to prepare statement: ' . mysqli_error($con));
    mysqli_stmt_bind_param($stmt, 'ssssssdss', $customer_name, $customer_email, $customer_phone, $service, $date, $time, $notes, $amount, $payment_option);
}

if (!mysqli_stmt_execute($stmt)) {
    json_error('Failed to create booking: ' . mysqli_stmt_error($stmt));
}
$id = mysqli_insert_id($con);

$data = [
    'id' => $id,
    'userId' => $user_id,
    'name' => $customer_name,
    'email' => $customer_email,
    'phone' => $customer_phone,
    'service' => $service,
    'date' => $date,
    'time' => $time,
    'notes' => $notes,
    'amount' => (float)$amount,
    'paymentOption' => $payment_option,
    'status' => 'pending'
];

json_ok($data, 201);
