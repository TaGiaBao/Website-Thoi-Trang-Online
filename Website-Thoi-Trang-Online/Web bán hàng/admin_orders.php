<?php
// admin_orders.php - list orders (admin only)
include 'db_connect.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

if (!isset($conn) || $conn === null) {
    echo json_encode(['success' => false, 'message' => 'DB connection error']);
    exit;
}

// require logged-in admin
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}
$uid = intval($_SESSION['user_id']);
$check = $conn->prepare('SELECT role FROM Users WHERE user_id = ? LIMIT 1');
$check->execute([$uid]);
$r = $check->fetch(PDO::FETCH_ASSOC);
if (!$r || ($r['role'] ?? '') !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Admin only']);
    exit;
}

try {
    $sql = "SELECT o.*, u.email FROM Orders o LEFT JOIN Users u ON o.user_id = u.user_id ORDER BY o.created_at DESC";
    $stmt = $conn->query($sql);
    $orders = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $row['items'] = $row['items'] ? json_decode($row['items'], true) : [];
        $orders[] = $row;
    }
    echo json_encode(['success' => true, 'orders' => $orders], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
exit;
?>
