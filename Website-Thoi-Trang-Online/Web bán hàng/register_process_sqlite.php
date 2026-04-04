<?php
/**
 * register_process.php - SQLite Version
 * Compatível com SQLite/PDO
 */

include 'db_connect_sqlite.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

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
    $raw = file_get_contents('php://input');
    $out = ['method' => $_SERVER['REQUEST_METHOD'], 'query' => $_GET, 'post' => $_POST, 'raw' => $raw];
    @file_put_contents(__DIR__ . '/register_debug.log', date('c') . " " . json_encode($out, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND);
    echo json_encode(['success' => true, 'debug' => $out], JSON_UNESCAPED_UNICODE);
    exit;
}

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
    echo json_encode(['success' => false, 'message' => 'Email e senha são obrigatórios'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Verificar se email já existe
    $checkSql = "SELECT user_id FROM Users WHERE email = ? LIMIT 1";
    $stmt = $conn->prepare($checkSql);
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Email já foi registrado'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // Hash da senha
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $createdAt = date('Y-m-d H:i:s');
    
    // Inserir novo usuário
    $insertSql = "INSERT INTO Users (email, password_hash, first_name, last_name, phone, created_at) 
                  VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($insertSql);
    
    if ($stmt->execute([$email, $passwordHash, $firstName, $lastName, $phone, $createdAt])) {
        echo json_encode(['success' => true, 'message' => 'Registro realizado com sucesso'], JSON_UNESCAPED_UNICODE);
    } else {
        @file_put_contents(__DIR__ . '/register_debug.log', date('c') . " INSERT ERROR\n", FILE_APPEND);
        echo json_encode(['success' => false, 'message' => 'Não foi possível criar a conta'], JSON_UNESCAPED_UNICODE);
    }
    
} catch (PDOException $e) {
    @file_put_contents(__DIR__ . '/register_debug.log', date('c') . " ERROR: " . $e->getMessage() . PHP_EOL, FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor'], JSON_UNESCAPED_UNICODE);
}
exit;
?>
