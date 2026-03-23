<?php
include 'db_connect.php';
header('Content-Type: application/json; charset=utf-8');

if (!isset($conn) || $conn === null) {
    echo json_encode(['success' => false, 'message' => 'DB not connected', 'db_error_log' => file_exists(__DIR__.'/db_connect.log') ? file_get_contents(__DIR__.'/db_connect.log') : null], JSON_UNESCAPED_UNICODE);
    exit;
}

$email = 'admin@example.com';
$sql = "SELECT user_id, email, password_hash, first_name, last_name, phone, created_at FROM Users WHERE email = ? LIMIT 1";
if ($stmt = $conn->prepare($sql)) {
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($row = $res->fetch_assoc()) {
        echo json_encode(['success' => true, 'user' => $row], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode(['success' => false, 'message' => 'Admin not found']);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Prepare failed', 'error' => $conn->error], JSON_UNESCAPED_UNICODE);
}

?>