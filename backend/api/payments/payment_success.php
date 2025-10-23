<?php
require_once __DIR__ . '/../utils/bootstrap.php';
include('../config/database.php');

// Add CORS headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json');

// Get payment status from PayFast return
$order_id = $_GET['m_payment_id'] ?? '';
$status = $_GET['payment_status'] ?? '';

error_log("Payment return: Order ID = $order_id, Status = $status");

if (empty($order_id)) {
    echo json_encode(['error' => 'No order ID provided']);
    exit;
}

// Get order details
$stmt = $con->prepare("SELECT * FROM orders WHERE order_id = ?");
$stmt->bind_param("s", $order_id);
$stmt->execute();
$result = $stmt->get_result();
$order = $result->fetch_assoc();
$stmt->close();

if (!$order) {
    echo json_encode(['error' => 'Order not found']);
    exit;
}

// Determine payment status and remaining amount
$order_status = $order['status'];
$paid_amount = $order['total'];

// Try to get payment records to see actual paid amount
$payment_stmt = $con->prepare("SELECT SUM(amount) as total_paid FROM payments WHERE order_id = ? AND status = 'COMPLETE'");
$payment_stmt->bind_param("s", $order_id);
$payment_stmt->execute();
$payment_result = $payment_stmt->get_result();
$payment_data = $payment_result->fetch_assoc();
$payment_stmt->close();

$total_paid = $payment_data['total_paid'] ?? $paid_amount;

// Parse service information
$items_json = $order['items_json'];
$service_info = null;
if ($items_json) {
    $items = json_decode($items_json, true);
    if ($items && count($items) > 0) {
        $service_info = $items[0];
    }
}

$service_amount = $service_info['amount'] ?? $paid_amount;
$is_deposit = $total_paid < $service_amount && $total_paid >= ($service_amount * 0.4);
$remaining_amount = max(0, $service_amount - $total_paid);

echo json_encode([
    'success' => true,
    'order_id' => $order_id,
    'payment_status' => $order_status,
    'paid_amount' => $total_paid,
    'service_amount' => $service_amount,
    'remaining_amount' => $remaining_amount,
    'is_deposit' => $is_deposit,
    'is_full_payment' => $total_paid >= $service_amount,
    'service_name' => $service_info['name'] ?? 'Service',
    'customer_name' => $order['customer_name'],
    'customer_email' => $order['customer_email']
]);
?>
