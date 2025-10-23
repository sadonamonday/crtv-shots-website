<?php
// Admin authentication middleware
require_once __DIR__ . '/database.php';

session_start();

function checkAdminAuth() {
    global $con;
    
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        return [
            'success' => false,
            'message' => 'Not authenticated',
            'redirect' => '/login'
        ];
    }
    
    $userId = $_SESSION['user_id'];
    
    // Check if user has admin role
    $stmt = $con->prepare("SELECT role FROM signup WHERE user_id = ?");
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        return [
            'success' => false,
            'message' => 'User not found',
            'redirect' => '/login'
        ];
    }
    
    $row = $result->fetch_assoc();
    
    if ($row['role'] !== 'admin') {
        return [
            'success' => false,
            'message' => 'Access denied. Admin privileges required.',
            'redirect' => '/'
        ];
    }
    
    return [
        'success' => true,
        'user_id' => $userId
    ];
}

// Function to require admin auth for admin pages
function requireAdminAuth() {
    $authResult = checkAdminAuth();
    
    if (!$authResult['success']) {
        header('Content-Type: application/json');
        http_response_code(403);
        echo json_encode($authResult);
        exit;
    }
    
    return $authResult;
}
?>
