<?php
/**
 * get_products.php - SQLite Version
 * Compatível com SQLite/PDO
 */

include 'db_connect_sqlite.php';

header('Content-Type: application/json; charset=utf-8');

// Nhận loại danh mục từ giao diện
$cat_code = isset($_GET['category']) ? trim($_GET['category']) : '';
$data = [];

// If DB connect failed
if (!isset($conn) || $conn === null) {
    echo json_encode(['success' => false, 'message' => 'Erro de conexão ao banco de dados'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Construir consulta com SQLite
    $baseSql = "SELECT p.*, GROUP_CONCAT(s.size_name, ',') AS all_sizes
                FROM Products p
                LEFT JOIN Product_Sizes s ON p.product_id = s.product_id
                LEFT JOIN Categories c ON p.category_id = c.category_id";
    
    if ($cat_code !== '') {
        $baseSql .= " WHERE c.category_code = :category";
    }
    
    $baseSql .= " GROUP BY p.product_id";
    
    $stmt = $conn->prepare($baseSql);
    
    if ($cat_code !== '') {
        $stmt->bindParam(':category', $cat_code, PDO::PARAM_STR);
    }
    
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($results as $row) {
        $row['size'] = $row['all_sizes'] ? explode(',', $row['all_sizes']) : [];
        unset($row['all_sizes']);
        $data[] = $row;
    }
    
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    @file_put_contents(__DIR__ . '/db_connect.log', date('c') . " QUERY_ERROR: " . $e->getMessage() . PHP_EOL, FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Erro ao buscar produtos', 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
exit;
?>
