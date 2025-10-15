<?php

header('Content-Type: application/json');

// database connection
//going to use env variables once db connectionn established
$host = '';
$db   = '';
$user = '';
$pass = '';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}


$sql = "SELECT url FROM images";
$result = $conn->query($sql);

$images = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $images[] = $row['url'];
    }
}

$conn->close();

echo json_encode($images);