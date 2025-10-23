<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
require_once __DIR__ . '/../utils/bootstrap.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed', 405);
}

// Check database connection
if (!$con) {
    json_error('Database connection failed: ' . mysqli_connect_error(), 500);
}

// Ensure table exists for first-time environments
mysqli_query($con, "CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) DEFAULT NULL,
  customer_phone VARCHAR(64) DEFAULT NULL,
  service VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(32) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  amount DECIMAL(10,2) DEFAULT 0,
  payment_option VARCHAR(16) DEFAULT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Ensure payments table exists and has booking_id for linkage
mysqli_query($con, "CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NULL,
  booking_id INT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  provider VARCHAR(64) NULL,
  provider_txn_id VARCHAR(128) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (order_id),
  INDEX (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
// Backward-compat: add booking_id column if table already existed without it
$colRes = mysqli_query($con, "SHOW COLUMNS FROM payments LIKE 'booking_id'");
if ($colRes && mysqli_num_rows($colRes) === 0) {
    @mysqli_query($con, "ALTER TABLE payments ADD COLUMN booking_id INT NULL, ADD INDEX (booking_id)");
}

// Check if user is admin
$is_admin = false;
if (isset($_GET['admin']) && $_GET['admin'] == '1') {
    // For admin dashboard access, allow access if admin=1 is passed
    // In production, you might want to add additional authentication checks
    $is_admin = true;
    
    // Verify the user is actually an admin
    $user_id = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;
    if ($user_id) {
        // Check if user has admin role in signup table
        $admin_check = mysqli_prepare($con, "SELECT role FROM signup WHERE user_id = ?");
        if ($admin_check) {
            mysqli_stmt_bind_param($admin_check, 'i', $user_id);
            mysqli_stmt_execute($admin_check);
            $result = mysqli_stmt_get_result($admin_check);
            $user_data = $result->fetch_assoc();
            mysqli_stmt_close($admin_check);
            $is_admin = ($user_data && $user_data['role'] === 'admin');
        }
    }
}

// Filters
$status = isset($_GET['status']) ? trim($_GET['status']) : '';
$email = isset($_GET['email']) ? trim($_GET['email']) : '';
$date_from = isset($_GET['date_from']) ? trim($_GET['date_from']) : '';
$date_to = isset($_GET['date_to']) ? trim($_GET['date_to']) : '';

// Set user_id if not already set (for non-admin requests)
if (!isset($user_id)) {
    $user_id = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;
}

$conditions = [];
$params = [];
$types = '';

if ($user_id && !$is_admin) { $conditions[] = 'user_id = ?'; $params[] = $user_id; $types .= 'i'; }
if ($status !== '') { $conditions[] = 'status = ?'; $params[] = $status; $types .= 's'; }
if ($email !== '') { $conditions[] = 'customer_email = ?'; $params[] = $email; $types .= 's'; }
if ($date_from !== '') { $conditions[] = 'date >= ?'; $params[] = $date_from; $types .= 's'; }
if ($date_to !== '') { $conditions[] = 'date <= ?'; $params[] = $date_to; $types .= 's'; }

$limit = $is_admin ? 200 : 50;

if (!empty($conditions)) {
    $sql = 'SELECT id, customer_name, customer_email, customer_phone, service, date, time, notes, amount, payment_option, status, created_at FROM bookings WHERE ' . implode(' AND ', $conditions) . ' ORDER BY created_at DESC LIMIT ' . $limit;
    $stmt = mysqli_prepare($con, $sql);
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, $types, ...$params);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
    } else {
        $res = false;
    }
} else {
    // Select without user_id since the column doesn't exist in the bookings table
    $sql = "SELECT id, customer_name, customer_email, customer_phone, service, date, time, notes, amount, payment_option, status, created_at FROM bookings ORDER BY created_at DESC LIMIT $limit";
    $res = mysqli_query($con, $sql);
}

$list = [];
$ids = [];
if ($res) {
    while ($row = mysqli_fetch_assoc($res)) {
        $ids[] = (int)$row['id'];
        $list[] = [
            'id' => (int)$row['id'],
            'userId' => null, // user_id column doesn't exist in bookings table
            'customer' => $row['customer_name'],
            'service' => $row['service'],
            'date' => $row['date'],
            'time' => $row['time'],
            'status' => $row['status'],
            'email' => $row['customer_email'],
            'phone' => $row['customer_phone'],
            'notes' => $row['notes'],
            'amount' => (float)$row['amount'],
            'paymentOption' => $row['payment_option'],
            'createdAt' => $row['created_at'],
            'payments' => [],
            'paymentsTotal' => 0.0,
        ];
    }
}

// Attach payments per booking in bulk
if (!empty($ids)) {
    $in = implode(',', array_fill(0, count($ids), '?'));
    $pTypes = str_repeat('i', count($ids));
    $pSql = "SELECT booking_id, id, amount, provider, provider_txn_id, status, created_at FROM payments WHERE booking_id IN ($in) ORDER BY id DESC";
    $pStmt = mysqli_prepare($con, $pSql);
    if ($pStmt) {
        mysqli_stmt_bind_param($pStmt, $pTypes, ...$ids);
        if (mysqli_stmt_execute($pStmt)) {
            $pRes = mysqli_stmt_get_result($pStmt);
            $byBooking = [];
            while ($p = mysqli_fetch_assoc($pRes)) {
                $bId = (int)$p['booking_id'];
                if (!isset($byBooking[$bId])) $byBooking[$bId] = [];
                $byBooking[$bId][] = [
                    'id' => (int)$p['id'],
                    'amount' => (float)$p['amount'],
                    'provider' => $p['provider'] ?? null,
                    'providerTxnId' => $p['provider_txn_id'] ?? null,
                    'status' => $p['status'] ?? null,
                    'createdAt' => $p['created_at'] ?? null,
                ];
            }
            // merge back and compute totals
            foreach ($list as &$bk) {
                $arr = $byBooking[$bk['id']] ?? [];
                $bk['payments'] = $arr;
                $total = 0.0;
                foreach ($arr as $pp) { $total += (float)$pp['amount']; }
                $bk['paymentsTotal'] = $total;
            }
            unset($bk);
        }
    }
}

json_ok($list);
