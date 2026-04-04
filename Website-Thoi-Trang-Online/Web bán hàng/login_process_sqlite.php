<?php
/**
 * login_process.php - SQLite Version
 * Compatível com SQLite/PDO
 */

include 'db_connect_sqlite.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'OK']);
    exit;
}

if (!isset($conn) || $conn === null) {
    echo json_encode(['success' => false, 'message' => 'Erro de conexão ao banco de dados'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (isset($_GET['debug']) && $_GET['debug'] == '1') {
    $method = $_SERVER['REQUEST_METHOD'];
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $raw = file_get_contents('php://input');
    $out = ['method' => $method, 'headers' => $headers, 'raw_body' => $raw, 'query' => $_GET, 'post' => $_POST];
    @file_put_contents(__DIR__ . '/login_debug.log', date('c') . " " . json_encode($out, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND);
    echo json_encode(['success' => true, 'debug' => $out], JSON_UNESCAPED_UNICODE);
    exit;
}

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
    echo json_encode(['success' => false, 'message' => 'Email e senha são obrigatórios'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $checkSql = "SELECT user_id, password_hash, first_name, last_name FROM Users WHERE email = ? LIMIT 1";
    $stmt = $conn->prepare($checkSql);
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Email ou senha incorretos'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    if (!password_verify($password, $user['password_hash'])) {
        echo json_encode(['success' => false, 'message' => 'Email ou senha incorretos'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // Login bem-sucedido
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['email'] = $email;
    $_SESSION['first_name'] = $user['first_name'];
    $_SESSION['last_name'] = $user['last_name'];
    
    echo json_encode([
        'success' => true,
        'message' => 'Login realizado com sucesso',
        'user' => [
            'id' => $user['user_id'],
            'email' => $email,
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name']
        ]
    ], JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    @file_put_contents(__DIR__ . '/login_debug.log', date('c') . " ERROR: " . $e->getMessage() . PHP_EOL, FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor', 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
exit;
?>
