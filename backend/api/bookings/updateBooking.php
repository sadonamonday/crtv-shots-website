<?php
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    json_error('Method not allowed', 405);
}

$body = json_input();
$id = (int)($body['id'] ?? 0);
if ($id <= 0) json_error('Missing booking id');

$fields = [];
$params = [];
$types = '';

$map = [
    'customer' => ['customer_name', 's'],
    'name' => ['customer_name', 's'],
    'email' => ['customer_email', 's'],
    'phone' => ['customer_phone', 's'],
    'service' => ['service', 's'],
    'date' => ['date', 's'],
    'time' => ['time', 's'],
    'notes' => ['notes', 's'],
    'amount' => ['amount', 'd'],
    'paymentOption' => ['payment_option', 's'],
    'status' => ['status', 's'],
];

foreach ($map as $in => [$col, $t]) {
    if (array_key_exists($in, $body)) {
        $fields[] = "$col = ?";
        $params[] = $body[$in];
        $types .= $t;
    }
}

if (empty($fields)) {
    json_error('No fields to update');
}

$sql = 'UPDATE bookings SET ' . implode(', ', $fields) . ' WHERE id = ?';
$params[] = $id;
$types .= 'i';

$stmt = mysqli_prepare($con, $sql);
if (!$stmt) json_error('Failed to prepare');

mysqli_stmt_bind_param($stmt, $types, ...$params);

if (!mysqli_stmt_execute($stmt)) {
    json_error('Failed to update booking');
}

json_ok(['ok' => true]);
