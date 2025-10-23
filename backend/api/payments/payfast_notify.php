<?php
include('../config/database.php');

$postData = $_POST;

// Log the notification
file_put_contents('payfast_log.txt', print_r($postData, true), FILE_APPEND);
error_log("PayFast Notification: " . json_encode($postData));

$order_id = $postData['m_payment_id'] ?? '';
$amount = $postData['amount_gross'] ?? 0;
$email = $postData['email_address'] ?? '';
$status = $postData['payment_status'] ?? 'Pending';

error_log("Processing payment: Order ID = $order_id, Amount = $amount, Status = $status");

// Ensure payments table exists
mysqli_query($con, "CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Insert payment record
$sql = "INSERT INTO payments (order_id, email, amount, status) VALUES (?, ?, ?, ?)";
$stmt = $con->prepare($sql);
$stmt->bind_param("ssds", $order_id, $email, $amount, $status);
$stmt->execute();
$stmt->close();

// Update order status if payment was successful
if ($status === 'COMPLETE') {
    $update_sql = "UPDATE orders SET status = 'paid' WHERE order_id = ?";
    $update_stmt = $con->prepare($update_sql);
    $update_stmt->bind_param("s", $order_id);
    $update_stmt->execute();
    $update_stmt->close();
    error_log("Order status updated to 'paid' for order: $order_id");
} else {
    error_log("Payment not complete. Status: $status");
}

header("HTTP/1.0 200 OK");
flush();
?>
