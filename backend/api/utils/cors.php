<?php
// utils/cors.php

// Allow your React dev server
header("Access-Control-Allow-Origin: http://localhost:5173");

// Allow cookies/sessions if you’re using them
header("Access-Control-Allow-Credentials: true");

// Allow common methods
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Allow headers
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}