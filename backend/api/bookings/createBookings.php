<?php
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
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
        json_error('Selected date is not available', 409);
    }
} else {
    // If preparing the statement failed for some reason, fail safe
    json_error('Failed to validate availability');
}

// Ensure bookings table exists (idempotent)
mysqli_query($con, "CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
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

$stmt = mysqli_prepare($con, "INSERT INTO bookings (customer_name, customer_email, customer_phone, service, date, time, notes, amount, payment_option, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')");
if (!$stmt) json_error('Failed to prepare statement');
mysqli_stmt_bind_param($stmt, 'sssssssdss', $customer_name, $customer_email, $customer_phone, $service, $date, $time, $notes, $amount, $payment_option);

if (!mysqli_stmt_execute($stmt)) {
    json_error('Failed to create booking');
}
$id = mysqli_insert_id($con);

$data = [
    'id' => $id,
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
