<?php
/**
 * Compatibility wrapper: include SQLite connection.
 * Keeps existing includes that expect `db_connect.php` working.
 */

$sqlite = __DIR__ . '/db_connect_sqlite.php';
if (file_exists($sqlite)) {
    include $sqlite;
    return;
}

// If SQLite file missing, set $conn to null and log.
@file_put_contents(__DIR__ . '/db_connect.log', date('c') . " MISSING sqlite wrapper\n", FILE_APPEND);
$conn = null;
?>
