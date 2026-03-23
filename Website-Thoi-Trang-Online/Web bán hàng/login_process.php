<?php
include 'db_connect.php';

// Allow CORS and handle preflight so fetch from pages works during development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');
session_start();

// Respond to OPTIONS preflight immediately
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

// Debug helper: when called with ?debug=1, return request method, headers and raw body
if (isset($_GET['debug']) && $_GET['debug'] == '1') {
	$method = $_SERVER['REQUEST_METHOD'];
	$headers = function_exists('getallheaders') ? getallheaders() : [];
	$raw = file_get_contents('php://input');
	$out = [
		'method' => $method,
		'headers' => $headers,
		'raw_body' => $raw,
		'query' => $_GET,
		'post' => $_POST
	];
	// Append to debug log for inspection
	@file_put_contents(__DIR__ . '/login_debug.log', date('c') . " " . json_encode($out, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND);
	echo json_encode(['success' => true, 'debug' => $out], JSON_UNESCAPED_UNICODE);
	exit;
}

// Đọc input (hỗ trợ JSON body, form-encoded hoặc GET fallback để debug nhanh)
$input = [];
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
	$input = $_GET;
} elseif (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false) {
	$raw = file_get_contents('php://input');
	$input = json_decode($raw, true) ?? [];
} else {
	$input = $_POST;
}

$email = isset($input['email']) ? trim($input['email']) : '';
$password = isset($input['password']) ? $input['password'] : '';

if ($email === '' || $password === '') {
	echo json_encode(['success' => false, 'message' => 'Thiếu thông tin đăng nhập']);
	exit;
}

$sql = "SELECT user_id, email, password_hash, first_name, last_name FROM Users WHERE email = ? LIMIT 1";
if ($stmt = $conn->prepare($sql)) {
	$stmt->bind_param('s', $email);
	$stmt->execute();
	$res = $stmt->get_result();
	if ($row = $res->fetch_assoc()) {
		// Support: password stored as PHP password_hash OR (dev) stored as plaintext
		$stored = $row['password_hash'];
		$verified = false;
		if (strlen($stored) >= 60 && (strpos($stored, '$2y$') === 0 || strpos($stored, '$2b$') === 0 || strpos($stored, '$2a$') === 0)) {
			$verified = password_verify($password, $stored);
		} else {
			// fallback: plaintext check (development convenience)
			$verified = ($password === $stored);
		}
		if ($verified) {
			// If plaintext was used, upgrade to a secure hash
			if (!(strlen($stored) >= 60 && (strpos($stored, '$2y$') === 0 || strpos($stored, '$2b$') === 0 || strpos($stored, '$2a$') === 0)) {
				$secureHash = password_hash($password, PASSWORD_DEFAULT);
				$uSql = "UPDATE Users SET password_hash = ? WHERE user_id = ?";
				if ($uStmt = $conn->prepare($uSql)) {
					$uStmt->bind_param('si', $secureHash, $row['user_id']);
					$uStmt->execute();
					$uStmt->close();
				}
			}
			// Đăng nhập thành công
			$_SESSION['user_id'] = $row['user_id'];
			$_SESSION['email'] = $row['email'];
			$user = [
				'user_id' => $row['user_id'],
				'email' => $row['email'],
				'first_name' => $row['first_name'],
				'last_name' => $row['last_name']
			];
			echo json_encode(['success' => true, 'user' => $user]);
		} else {
			echo json_encode(['success' => false, 'message' => 'Sai mật khẩu']);
		}
	} else {
		echo json_encode(['success' => false, 'message' => 'Tài khoản không tồn tại']);
	}
	$stmt->close();
} else {
	echo json_encode(['success' => false, 'message' => 'Lỗi máy chủ']);
}

exit;
?>

