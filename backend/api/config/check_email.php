<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include __DIR__ . "/database.php";

$email = $_GET['email'] ?? '';
$result=['available'=>true];

if($email){
    $stmt=$con->prepare("SELECT user_id FROM signup WHERE user_email=?");
    $stmt->bind_param("s",$email);
    $stmt->execute();
    if($stmt->get_result()->num_rows>0)$result['available']=false;
}
echo json_encode($result);
