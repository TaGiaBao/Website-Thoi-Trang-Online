<?php
$host = "localhost";
$user = "root";      // Mặc định của XAMPP
$pass = "123456";          // Mặc định của XAMPP là để trống
$db   = "FashionStore_DB";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    // Log connection error and make $conn null so callers can return JSON errors instead of HTML die()
    @file_put_contents(__DIR__ . '/db_connect.log', date('c') . " CONNECT_ERROR: " . $conn->connect_error . PHP_EOL, FILE_APPEND);
    $conn = null;
} else {
    $conn->set_charset("utf8mb4"); // Đảm bảo không lỗi font tiếng Việt
}
?>