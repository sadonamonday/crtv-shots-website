<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../utils/bootstrap.php';
include('../config/database.php');

// Check database connection
if (!$con) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

//credentials
$merchant_id = '10042984';
$merchant_key = '0hosrb56vjsv7';
$passphrase = ''; // optional

$payfast_url = 'https://sandbox.payfast.co.za/eng/process';

// Get order data from frontend
$rawData = json_decode(file_get_contents("php://input"), true);

// Log received data for debugging
error_log("Received payment data: " . json_encode($rawData));

if (!$rawData) {
    echo json_encode(["error" => "No input received"]);
    exit;
}

$amount = floatval($rawData['amount'] ?? 0);
$item_name = trim($rawData['item_name'] ?? 'Service');
$item_description = trim($rawData['item_description'] ?? '');
$email = trim($rawData['email'] ?? 'customer@example.com');
$user_id = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;

// Log session information for debugging
error_log("Session user_id: " . ($user_id ?? 'null'));
error_log("Session data: " . json_encode($_SESSION ?? []));

// Validate required fields
if ($amount <= 0) {
    echo json_encode(["error" => "Invalid amount"]);
    exit;
}

if (empty($item_name)) {
    echo json_encode(["error" => "Item name is required"]);
    exit;
}

// Create order first
$order_id = uniqid("ORDER_");
$customer_name = $rawData['customer_name'] ?? 'Customer';
$customer_phone = $rawData['customer_phone'] ?? '';

// Ensure orders table exists
mysqli_query($con, "CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(255) UNIQUE,
  user_id INT NULL,
  customer_name VARCHAR(255) NULL,
  customer_email VARCHAR(255) NULL,
  customer_phone VARCHAR(64) NULL,
  items_json JSON NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Add order_id column if it doesn't exist (for existing tables)
$result = mysqli_query($con, "SHOW COLUMNS FROM orders LIKE 'order_id'");
if (!$result || mysqli_num_rows($result) == 0) {
    mysqli_query($con, "ALTER TABLE orders ADD COLUMN order_id VARCHAR(255) UNIQUE");
}

// Insert order
$stmt = mysqli_prepare($con, "INSERT INTO orders (order_id, user_id, customer_name, customer_email, customer_phone, items_json, total, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)");
if (!$stmt) {
    echo json_encode(["error" => "Failed to prepare order statement: " . mysqli_error($con)]);
    exit;
}

$items_json = json_encode([['name' => $item_name, 'description' => $item_description, 'amount' => $amount]], JSON_UNESCAPED_UNICODE);
$notes = "Payment initiated via PayFast";
mysqli_stmt_bind_param($stmt, 'sissssds', $order_id, $user_id, $customer_name, $email, $customer_phone, $items_json, $amount, $notes);

if (!mysqli_stmt_execute($stmt)) {
    echo json_encode(["error" => "Failed to create order: " . mysqli_stmt_error($stmt)]);
    mysqli_stmt_close($stmt);
    exit;
}

mysqli_stmt_close($stmt);

// Log successful order creation
error_log("Order created successfully: " . $order_id);


// Create payment request
$data = [
    'merchant_id' => $merchant_id,
    'merchant_key' => $merchant_key,
    'return_url' => 'http://localhost:5173/profile',
    'cancel_url' => 'http://localhost:5173/bookings',
    'notify_url' => 'http://localhost:8000/payments/payfast_notify.php',
    'name_first' => explode(' ', $customer_name)[0] ?? 'Customer',
    'name_last' => explode(' ', $customer_name)[1] ?? 'User',
    'email_address' => $email,
    'm_payment_id' => $order_id,
    'amount' => number_format($amount, 2, '.', ''),
    'item_name' => $item_name,
    'item_description' => $item_description
];

// Generate signature
function generateSignature($data, $passphrase = '') {
    ksort($data);
    $queryString = '';
    foreach ($data as $key => $val) {
        if ($val !== '') {
            $queryString .= "$key=" . urlencode(trim($val)) . "&";
        }
    }
    $queryString = rtrim($queryString, '&');
    if ($passphrase !== '') {
        $queryString .= "&passphrase=" . urlencode($passphrase);
    }
    return md5($queryString);
}

$data['signature'] = generateSignature($data, $passphrase);

$redirectUrl = $payfast_url . '?' . http_build_query($data);

// Log the PayFast request for debugging
error_log("PayFast Request: " . json_encode($data));
error_log("PayFast Redirect URL: " . $redirectUrl);

// Validate redirect URL
if (empty($redirectUrl) || $redirectUrl === $payfast_url) {
    echo json_encode([
        'success' => false,
        'error' => 'Failed to generate PayFast redirect URL'
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'redirectUrl' => $redirectUrl,
    'order_id' => $order_id
]);
?>
