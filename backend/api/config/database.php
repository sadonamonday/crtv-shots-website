<?php
$host = "localhost";
$db_name = "crtvshots_db";
$username = "root";
$password = "Password3500";
$port = 3307;

$con = mysqli_connect($host, $username, $password, $db_name, $port);

// Note: Do not echo/die here on connection failure. Endpoints should handle $con === false and
// return proper JSON errors. This avoids leaking HTML into API responses.
?>