<?php
include 'db_connect.php';

// Nhận loại danh mục từ giao diện (ví dụ: quan-au, ao-nam)
$cat_code = isset($_GET['category']) ? trim($_GET['category']) : '';

$data = [];

// If DB connect failed, return JSON error
if (!isset($conn) || $conn === null) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => 'Lỗi kết nối cơ sở dữ liệu. Kiểm tra db_connect.php'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Xây dựng truy vấn an toàn với prepared statement
$baseSql = "SELECT p.*, GROUP_CONCAT(s.size_name) AS all_sizes
            FROM Products p
            LEFT JOIN Product_Sizes s ON p.product_id = s.product_id
            LEFT JOIN Categories c ON p.category_id = c.category_id";

if ($cat_code !== '') {
    $baseSql .= " WHERE c.category_code = ?";
}

$baseSql .= " GROUP BY p.product_id";

$debug = isset($_GET['debug']) && $_GET['debug'] == '1';

if ($stmt = $conn->prepare($baseSql)) {
    if ($cat_code !== '') {
        $stmt->bind_param('s', $cat_code);
    }
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $row['size'] = $row['all_sizes'] ? explode(',', $row['all_sizes']) : [];
            $data[] = $row;
        }
    } else {
        if ($debug) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['success' => false, 'error' => $stmt->error], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
    $stmt->close();
}
else {
    if ($debug) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => $conn->error], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($data, JSON_UNESCAPED_UNICODE);
?>