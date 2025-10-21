<?php
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
