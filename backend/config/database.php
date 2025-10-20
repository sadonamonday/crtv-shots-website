<?php
$host = "localhost";
$db_name = "crtvshots_db";
$username = "root";
$password = "Password3500";
$port = 3307;

$con = mysqli_connect($host, $username, $password, $db_name, $port);

if (!$con) {
    die("Connection Failed: " . mysqli_connect_error());
}

?>
