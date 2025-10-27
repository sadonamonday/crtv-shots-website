<?php
include '../config/database.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'] ?? '';
    $price = $_POST['price'] ?? '';
    $description = $_POST['description'] ?? '';
    $category = $_POST['category'] ?? '';
    $image = $_FILES['image'] ?? null;

    if (!$title || !$price || !$category || !$image) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit;
    }

    // Handle image upload
    $targetDir = "../uploads/";
    $imageName = time() . '_' . basename($image['name']);
    $targetFilePath = $targetDir . $imageName;

    if (move_uploaded_file($image['tmp_name'], $targetFilePath)) {
        // Insert product into DB
        $stmt = $con->prepare("INSERT INTO products (title, price, description, image, category) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sdsss", $title, $price, $description, $imageName, $category);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Product added successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Database insert failed: ' . $stmt->error]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Image upload failed']);
    }
}
?>