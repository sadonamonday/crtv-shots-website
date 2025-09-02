<?php
$host = "localhost";
$db_name = "crtvshots_db";
$username = "root";
$password = "";
$port = 3306; // Change if using 3307 in XAMPP
try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name};port={$port}", $username, $password);
    $conn->exec("set names utf8");
} catch(PDOException $exception){
    echo "Connection error: " . $exception->getMessage();
}
?>
