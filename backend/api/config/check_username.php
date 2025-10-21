<?php
include __DIR__ . "/database.php";

$username = $_GET['username'] ?? '';
$result = ['available'=>true,'suggestions'=>[]];

if($username){
    $stmt = $con->prepare("SELECT user_id FROM signup WHERE user_username=?");
    $stmt->bind_param("s",$username);
    $stmt->execute();
    if($stmt->get_result()->num_rows>0){
        $result['available']=false;
        for($i=0;$i<5;$i++){
            $sugg = $username.rand(10,99);
            $r=$con->prepare("SELECT user_id FROM signup WHERE user_username=?");
            $r->bind_param("s",$sugg); $r->execute();
            if($r->get_result()->num_rows==0)$result['suggestions'][]=$sugg;
        }
    }
}
echo json_encode($result);
