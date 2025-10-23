<?php
$host = "localhost";
$db_name = "CRTV";
$username = "root";
$password = "";
$port = 3306;

$con = mysqli_connect($host, $username, $password, $db_name, $port);

// Check connection
if (!$con) {
    // Don't echo/die here - let the calling script handle the error
    // This allows for proper JSON error responses
    error_log("Database connection failed: " . mysqli_connect_error());
}
?>