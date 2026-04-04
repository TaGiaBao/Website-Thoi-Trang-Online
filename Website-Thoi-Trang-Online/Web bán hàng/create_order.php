<?php
// create_order.php
// Records an order and notifies admin (SQLite)
include 'db_connect.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

if (!isset($conn) || $conn === null) {
    echo json_encode(['success' => false, 'message' => 'DB connection error']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data) $data = $_POST;

$items = $data['items'] ?? null;
$total = isset($data['total_amount']) ? intval($data['total_amount']) : null;

if ($items === null || $total === null) {
    echo json_encode(['success' => false, 'message' => 'Missing items or total_amount']);
    exit;
}

$user_id = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : null;
$items_json = json_encode($items, JSON_UNESCAPED_UNICODE);

try {
    $stmt = $conn->prepare("INSERT INTO Orders (user_id, total_amount, status, items) VALUES (?, ?, 'completed', ?)");
    $stmt->execute([$user_id, $total, $items_json]);
    $order_id = $conn->lastInsertId();

    // Create admin notification
    $msg = "New order #{$order_id} placed. Total: {$total}";
    $nstmt = $conn->prepare("INSERT INTO Admin_Notifications (type, message) VALUES (?, ?)");
    $nstmt->execute(['order_placed', $msg]);

    echo json_encode(['success' => true, 'order_id' => $order_id]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
exit;
?>
