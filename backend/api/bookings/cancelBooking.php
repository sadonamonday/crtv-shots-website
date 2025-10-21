<?php
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    json_error('Method not allowed', 405);
}

$body = $_SERVER['REQUEST_METHOD'] === 'POST' ? json_input() : json_input();
$id = (int)($body['id'] ?? 0);
if ($id <= 0) json_error('Missing booking id');

$stmt = mysqli_prepare($con, "UPDATE bookings SET status = 'cancelled' WHERE id = ?");
if (!$stmt) json_error('Failed to prepare');
mysqli_stmt_bind_param($stmt, 'i', $id);
if (!mysqli_stmt_execute($stmt)) {
    json_error('Failed to cancel booking');
}

json_ok(['ok' => true]);
