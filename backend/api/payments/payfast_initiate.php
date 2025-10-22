<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

include('../config/database.php');

//credentials
$merchant_id = '10042984';
$merchant_key = '0hosrb56vjsv7';
$passphrase = ''; // optional

$payfast_url = 'https://sandbox.payfast.co.za/eng/process';

// Get order data from frontend
$rawData = json_decode(file_get_contents("php://input"), true);

if (!$rawData) {
    echo json_encode(["error" => "No input received"]);
    exit;
}

$amount = $rawData['amount'] ?? 0;
$item_name = $rawData['item_name'] ?? 'Service';
$item_description = $rawData['item_description'] ?? '';
$email = $rawData['email'] ?? 'customer@example.com';


// Create payment request
$data = [
    'merchant_id' => $merchant_id,
    'merchant_key' => $merchant_key,
    'return_url' => 'http://localhost:5173/bookings',
    'cancel_url' => 'http://localhost:5173/bookings',
    'notify_url' => 'http://localhost/backend/payfast_notify.php',
    'name_first' => 'Test',
    'name_last' => 'User',
    'email_address' => $email,
    'm_payment_id' => uniqid("ORDER_"),
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

echo json_encode(['redirectUrl' => $redirectUrl]);
?>
