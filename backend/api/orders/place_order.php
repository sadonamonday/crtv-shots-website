<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Headers for CORS and JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");


include_once(__DIR__ . "/../config/database.php");

// Make sure $con exists
if (!isset($con)) {
    echo json_encode(["success" => false, "message" => "Database connection not found"]);
    exit;
}

// Get POST data
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request data",
        "raw" => $raw
    ]);
    exit;
}

// Extract order info safely
$name = trim($data["user_name"] ?? "");
$email = trim($data["user_email"] ?? "");
$address = trim($data["user_address"] ?? "");
$subtotal = floatval($data["subtotal"] ?? 0);
$shipping = floatval($data["shipping"] ?? 0);
$total = floatval($data["total"] ?? 0);
$items = $data["items"] ?? [];

if (empty($name) || empty($email) || empty($address)) {
    echo json_encode(["success" => false, "message" => "Name, email, and address are required"]);
    exit;
}

try {
    // Insert order
    $query = "INSERT INTO orders (name, email, address, subtotal, shipping, total, order_date)
              VALUES (?, ?, ?, ?, ?, ?, NOW())";
    $stmt = $con->prepare($query);
    if (!$stmt) {
        echo json_encode(["success" => false, "message" => "Prepare failed: " . $con->error]);
        exit;
    }

    $stmt->bind_param("sssddd", $name, $email, $address, $subtotal, $shipping, $total);
    $stmt->execute();
    $order_id = $con->insert_id;

    // Insert order items
    if (!empty($items) && is_array($items)) {
        $itemQuery = "INSERT INTO order_items (order_id, item_name, quantity, price) VALUES (?, ?, ?, ?)";
        $stmtItem = $con->prepare($itemQuery);

        foreach ($items as $item) {
            $itemName = trim($item["title"] ?? "");
            $itemQty = intval($item["quantity"] ?? 0);
            $itemPrice = floatval($item["price"] ?? 0);

            if ($itemName && $itemQty && $itemPrice) {
                $stmtItem->bind_param("isid", $order_id, $itemName, $itemQty, $itemPrice);
                $stmtItem->execute();
            }
        }
    }

    echo json_encode(["success" => true, "message" => "Order placed successfully"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}


?>