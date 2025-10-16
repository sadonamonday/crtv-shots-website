<?php
header('Access-Control-Allow-Origin: http://localhost:5173'); // allow your React dev server
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');
?>
<?php
header('Content-Type: application/json');

// Correct path to database.php
include __DIR__ . '/config/database.php';

try {
    $stmt = $con->prepare("SELECT id, name, rating, message FROM testimonials ORDER BY created_at DESC");
    $stmt->execute();
    $result = $stmt->get_result();

    $testimonials = [];
    while ($row = $result->fetch_assoc()) {
        $testimonials[] = [
            'id' => $row['id'],
            'name' => trim($row['name']),
            'rating' => (int)$row['rating'],
            'message' => $row['message'],
        ];
    }

    echo json_encode($testimonials);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
