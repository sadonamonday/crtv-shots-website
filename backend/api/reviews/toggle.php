<?php
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { json_error('Method not allowed', 405); }

$data = json_input();
$id = isset($data['id']) ? (int)$data['id'] : 0;
$approved = isset($data['approved']) ? (int)((bool)$data['approved']) : null;
if ($id <= 0) { json_error('id is required', 422); }
if ($approved === null) { json_error('approved is required', 422); }

$stmt = mysqli_prepare($con, 'UPDATE testimonials SET approved=? WHERE id=?');
if (!$stmt) { json_error('Failed to prepare update', 500); }
mysqli_stmt_bind_param($stmt, 'ii', $approved, $id);
if (!mysqli_stmt_execute($stmt)) { json_error('Failed to update testimonial status', 500); }

json_ok(['id' => $id, 'approved' => (bool)$approved]);
