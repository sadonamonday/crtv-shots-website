<?php
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') { json_error('Method not allowed', 405); }

$categoryId = isset($_GET['category_id']) ? (int)$_GET['category_id'] : 0;
if ($categoryId <= 0) { json_error('category_id is required', 422); }

// Verify category exists
$chk = mysqli_prepare($con, 'SELECT id, name, slug FROM categories WHERE id=?');
if ($chk) {
    mysqli_stmt_bind_param($chk, 'i', $categoryId);
    mysqli_stmt_execute($chk);
    $res = mysqli_stmt_get_result($chk);
    if (!$res || !mysqli_fetch_assoc($res)) { json_error('Category not found', 404); }
}

$sql = 'SELECT id, title, slug, description, price, currency, status, type, stock, category_id FROM products WHERE category_id=' . $categoryId . ' ORDER BY id DESC LIMIT 500';
$res = mysqli_query($con, $sql);
if ($res === false) { json_error('Failed to fetch products', 500); }

$out = [];
while ($row = mysqli_fetch_assoc($res)) {
    $row['id'] = (int)$row['id'];
    $row['stock'] = isset($row['stock']) ? (int)$row['stock'] : null;
    $row['category_id'] = isset($row['category_id']) ? (int)$row['category_id'] : null;
    $row['price'] = isset($row['price']) ? (0 + $row['price']) : null;
    $out[] = $row;
}

json_ok($out);
