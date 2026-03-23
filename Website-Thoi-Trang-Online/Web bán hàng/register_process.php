<?php
include 'db_connect.php';

// Allow CORS for development and handle preflight
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Handle OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'OK']);
    exit;
}

// If DB connect failed, return JSON error
if (!isset($conn) || $conn === null) {
    echo json_encode(['success' => false, 'message' => 'Lỗi kết nối cơ sở dữ liệu. Kiểm tra db_connect.php'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Debug helper
if (isset($_GET['debug']) && $_GET['debug'] == '1') {
    $raw = file_get_contents('php://input');
    $out = ['method' => $_SERVER['REQUEST_METHOD'], 'query' => $_GET, 'post' => $_POST, 'raw' => $raw];
    @file_put_contents(__DIR__ . '/register_debug.log', date('c') . " " . json_encode($out, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND);
    echo json_encode(['success' => true, 'debug' => $out], JSON_UNESCAPED_UNICODE);
    exit;
}

// Đọc input (hỗ trợ JSON hoặc form-encoded)
$input = [];
if (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false) {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true) ?? [];
} else {
    $input = $_POST;
}

$email = isset($input['email']) ? trim($input['email']) : '';
$password = isset($input['password']) ? $input['password'] : '';
$firstName = isset($input['firstName']) ? trim($input['firstName']) : '';
$lastName = isset($input['lastName']) ? trim($input['lastName']) : '';
$phone = isset($input['phone']) ? trim($input['phone']) : '';

if ($email === '' || $password === '') {
    echo json_encode(['success' => false, 'message' => 'Thiếu email hoặc mật khẩu']);
    exit;
}

// Kiểm tra email đã tồn tại
$checkSql = "SELECT user_id FROM Users WHERE email = ? LIMIT 1";
if ($stmt = $conn->prepare($checkSql)) {
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res->fetch_assoc()) {
        echo json_encode(['success' => false, 'message' => 'Email đã được đăng ký']);
        $stmt->close();
        exit;
    }
    $stmt->close();
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);
$createdAt = date('Y-m-d H:i:s');

$insertSql = "INSERT INTO Users (email, password_hash, first_name, last_name, phone, created_at) VALUES (?, ?, ?, ?, ?, ?)";
if ($stmt = $conn->prepare($insertSql)) {
    $stmt->bind_param('ssssss', $email, $passwordHash, $firstName, $lastName, $phone, $createdAt);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Đăng ký thành công']);
    } else {
        @file_put_contents(__DIR__ . '/register_debug.log', date('c') . " INSERT ERROR: " . $stmt->error . PHP_EOL, FILE_APPEND);
        echo json_encode(['success' => false, 'message' => 'Không thể tạo tài khoản', 'error' => $stmt->error]);
    }
    $stmt->close();
} else {
    @file_put_contents(__DIR__ . '/register_debug.log', date('c') . " PREPARE ERROR: " . $conn->error . PHP_EOL, FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Lỗi máy chủ', 'error' => $conn->error]);
}

exit;
?>
