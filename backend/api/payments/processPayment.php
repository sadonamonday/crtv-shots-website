<?php
require_once __DIR__ . '/../utils/cors.php';
include_once '../config/database.php';

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->email) && !empty($data->password)){
    $query = "INSERT INTO users (name, email, password) VALUES (:name, :email, :password)";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":name", $data->name);
    $stmt->bindParam(":email", $data->email);
    $stmt->bindParam(":password", password_hash($data->password, PASSWORD_BCRYPT));

    if($stmt->execute()){
        http_response_code(201);
        echo json_encode(["message" => "User registered successfully."]);
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Unable to register user."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
}
?>
