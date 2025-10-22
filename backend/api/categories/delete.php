<?php
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { json_error('Method not allowed', 405); }

$data = json_input();
$id = isset($data['id']) ? (int)$data['id'] : 0;
if ($id <= 0) { json_error('id is required', 422); }

// Check usage in products
$usedRes = mysqli_query($con, 'SELECT COUNT(*) AS cnt FROM products WHERE category_id=' . $id);
$used = 0;
if ($usedRes && ($u = mysqli_fetch_assoc($usedRes))) { $used = (int)$u['cnt']; }
if ($used > 0) {
    json_error('Category is in use by products and cannot be deleted', 409);
}

$del = mysqli_prepare($con, 'DELETE FROM categories WHERE id=?');
if (!$del) { json_error('Failed to prepare delete', 500); }
mysqli_stmt_bind_param($del, 'i', $id);
if (!mysqli_stmt_execute($del)) { json_error('Failed to delete category', 500); }

json_ok();
