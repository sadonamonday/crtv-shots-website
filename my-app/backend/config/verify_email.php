<?php
include __DIR__ . "/database.php";

if (isset($_GET['token'])) {
    $token = $_GET['token'];

    $stmt = $con->prepare("SELECT user_id, verification_token_expires_at FROM signup WHERE verification_token=? AND email_verified=0");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        if (strtotime($row['verification_token_expires_at']) > time()) {
            // Mark email as verified
            $update = $con->prepare("UPDATE signup SET email_verified=1, verification_token=NULL, verification_token_expires_at=NULL WHERE user_id=?");
            $update->bind_param("i", $row['user_id']);
            $update->execute();

            // Redirect to React login page
            echo "<script>
                    alert('Email verified successfully! Redirecting to login.');
                    window.location.href = 'http://localhost:5173/login';
                  </script>";
            exit;
        } else {
            echo "<script>
                    alert('Token expired. Please sign up again.');
                    window.location.href = 'http://localhost:5173/signup';
                  </script>";
            exit;
        }
    } else {
        echo "<script>
                alert('Invalid or already used token.');
                window.location.href = 'http://localhost:5173/login';
              </script>";
        exit;
    }
} else {
    echo "<script>
            alert('No token provided.');
            window.location.href = 'http://localhost:5173/signup';
          </script>";
    exit;
}
?>
