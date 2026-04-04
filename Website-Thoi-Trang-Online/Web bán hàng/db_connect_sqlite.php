<?php
/**
 * SQLite Database Connection (Substitui db_connect.php)
 * Use PDO para melhor compatibilidade com SQLite
 */

$db_path = __DIR__ . '/fashion_store.db';

// Verificar se banco existe
if (!file_exists($db_path)) {
    // Tentar criar automaticamente
    require_once __DIR__ . '/init_sqlite.php';
}

try {
    $conn = new PDO('sqlite:' . $db_path);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    // Configurar para melhor suporte a chaves estrangeiras
    $conn->exec("PRAGMA foreign_keys = ON");
    $conn->exec("PRAGMA encoding = 'UTF-8'");
    
} catch (PDOException $e) {
    @file_put_contents(__DIR__ . '/db_connect.log', date('c') . " CONNECT_ERROR: " . $e->getMessage() . PHP_EOL, FILE_APPEND);
    $conn = null;
}
?>
