<?php
// admin_stats.php - simple revenue stats (admin only)
include 'db_connect.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

if (!isset($conn) || $conn === null) {
    echo json_encode(['success' => false, 'message' => 'DB connection error']);
    exit;
}

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
    // Total revenue (completed)
    $tot = $conn->query("SELECT IFNULL(SUM(total_amount),0) AS total FROM Orders WHERE status = 'completed'")->fetch(PDO::FETCH_ASSOC);

    // Revenue last 30 days grouped by date
    $stmt = $conn->prepare("SELECT date(created_at) as day, IFNULL(SUM(total_amount),0) as revenue FROM Orders WHERE status='completed' AND created_at >= date('now','-30 days') GROUP BY date(created_at) ORDER BY day ASC");
    $stmt->execute();
    $by_day = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'total_revenue' => intval($tot['total']), 'revenue_by_day' => $by_day], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
exit;
?>
