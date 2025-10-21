<?php
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed', 405);
}

// Ensure table exists for first-time environments
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

$is_admin = isset($_GET['admin']) && $_GET['admin'] == '1';

if ($is_admin) {
    $sql = "SELECT id, customer_name, customer_email, customer_phone, service, date, time, notes, amount, payment_option, status, created_at FROM bookings ORDER BY created_at DESC LIMIT 200";
    $res = mysqli_query($con, $sql);
} else {
    // Without user auth, return recent bookings (could be filtered by email if provided)
    $email = isset($_GET['email']) ? trim($_GET['email']) : '';
    if ($email !== '') {
        $stmt = mysqli_prepare($con, "SELECT id, customer_name, customer_email, customer_phone, service, date, time, notes, amount, payment_option, status, created_at FROM bookings WHERE customer_email = ? ORDER BY created_at DESC LIMIT 100");
        mysqli_stmt_bind_param($stmt, 's', $email);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
    } else {
        $sql = "SELECT id, customer_name, customer_email, customer_phone, service, date, time, notes, amount, payment_option, status, created_at FROM bookings ORDER BY created_at DESC LIMIT 50";
        $res = mysqli_query($con, $sql);
    }
}

$list = [];
if ($res) {
    while ($row = mysqli_fetch_assoc($res)) {
        $list[] = [
            'id' => (int)$row['id'],
            'customer' => $row['customer_name'],
            'service' => $row['service'],
            'date' => $row['date'],
            'time' => $row['time'],
            'status' => $row['status'],
            'email' => $row['customer_email'],
            'phone' => $row['customer_phone'],
            'notes' => $row['notes'],
            'amount' => (float)$row['amount'],
            'paymentOption' => $row['payment_option'],
            'createdAt' => $row['created_at'],
        ];
    }
}

json_ok($list);
