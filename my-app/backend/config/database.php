<?php
$host = "localhost";
$db_name = "crtvshots_db";
$username = "CRTVSHOTS";     
$password = "CRTV1234";    
$port = 3306;

$con = mysqli_connect($host, $username, $password, $db_name, $port);

if (!$con) {
    die("Connection Failed: " . mysqli_connect_error());
}

?>
