<?php
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed', 405);
}

// Filters
$status = isset($_GET['status']) ? trim($_GET['status']) : null;
$q = isset($_GET['q']) ? trim($_GET['q']) : null;

$sql = "SELECT id, customer_name, customer_email, total, status, created_at, updated_at FROM orders";
$where = [];
$params = [];
$types = '';

if ($status) { $where[] = 'status = ?'; $types .= 's'; $params[] = $status; }
if ($q !== null && $q !== '') { $where[] = '(customer_name LIKE ? OR customer_email LIKE ?)'; $types .= 'ss'; $like = '%' . $q . '%'; $params[] = $like; $params[] = $like; }

if ($where) { $sql .= ' WHERE ' . implode(' AND ', $where); }
$sql .= ' ORDER BY id DESC';

$stmt = mysqli_prepare($con, $sql);
if (!$stmt) json_error('Failed to prepare statement');
if ($types) { mysqli_stmt_bind_param($stmt, $types, ...$params); }
if (!mysqli_stmt_execute($stmt)) json_error('Failed to export orders');
$res = mysqli_stmt_get_result($stmt);

// Output CSV
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=orders_export.csv');

$out = fopen('php://output', 'w');
fputcsv($out, ['id','customer_name','customer_email','total','status','created_at','updated_at']);
while ($row = mysqli_fetch_assoc($res)) {
    fputcsv($out, [
        $row['id'],
        $row['customer_name'],
        $row['customer_email'],
        $row['total'],
        $row['status'],
        $row['created_at'],
        $row['updated_at']
    ]);
}
fclose($out);
exit;
