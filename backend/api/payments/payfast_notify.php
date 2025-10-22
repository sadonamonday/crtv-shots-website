<?php
include('../config/database.php');

$postData = $_POST;


file_put_contents('payfast_log.txt', print_r($postData, true), FILE_APPEND);


$order_id = $postData['m_payment_id'] ?? '';
$amount = $postData['amount_gross'] ?? 0;
$email = $postData['email_address'] ?? '';
$status = $postData['payment_status'] ?? 'Pending';


$sql = "INSERT INTO payments (order_id, email, amount, status) VALUES (?, ?, ?, ?)";
$stmt = $con->prepare($sql);
$stmt->bind_param("ssds", $order_id, $email, $amount, $status);
$stmt->execute();
$stmt->close();

header("HTTP/1.0 200 OK");
flush();
?>
