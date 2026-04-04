<?php
// admin_notifications.php - list and mark notifications (admin only)
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

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
    $stmt = $conn->query("SELECT * FROM Admin_Notifications ORDER BY created_at DESC LIMIT 100");
    $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'notifications' => $notes], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;
    $id = isset($data['id']) ? intval($data['id']) : null;
    if ($id) {
        $u = $conn->prepare('UPDATE Admin_Notifications SET is_read = 1 WHERE id = ?');
        $u->execute([$id]);
        echo json_encode(['success' => true]);
        exit;
    }
    echo json_encode(['success' => false, 'message' => 'Missing id']);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Method not allowed']);
exit;
?>
