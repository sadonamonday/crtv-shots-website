<?php
require_once __DIR__ . '/../../utils/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';

if (!in_array($_SERVER['REQUEST_METHOD'], ['PATCH', 'POST'], true)) {
    json_error('Method Not Allowed', 405);
}


$payload = $_POST;
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $payload = json_input();
}

$id = isset($payload['id']) ? (int)$payload['id'] : 0;
if (!$id) {
    json_error('Missing id', 400);
}

$fields = [];
$params = [];
$types = '';

if (isset($payload['title'])) {
    $fields[] = 'title = ?';
    $params[] = (string)$payload['title'];
    $types .= 's';
}
if (isset($payload['visible'])) {
    $fields[] = 'visible = ?';
    $params[] = (int)((bool)$payload['visible']);
    $types .= 'i';
}
if (isset($payload['sort'])) {
    $fields[] = 'sort = ?';
    $params[] = (int)$payload['sort'];
    $types .= 'i';
}

if (!$fields) {
    json_error('No fields to update', 400);
}

$sql = 'UPDATE gallery_photos SET ' . implode(', ', $fields) . ' WHERE id = ?';
$params[] = $id;
$types .= 'i';

$stmt = $con->prepare($sql);
$stmt->bind_param($types, ...$params);
if (!$stmt->execute()) {
    json_error('Failed to update', 500);
}

json_ok(['id' => $id]);
