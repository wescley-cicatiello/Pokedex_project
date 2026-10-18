<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/../src/database.php';
try {
    $count = (int) database()->query('SELECT COUNT(*) FROM pokemon')->fetchColumn();
    if ($count !== 151) throw new RuntimeException('Catálogo incompleto');
    echo json_encode(['status'=>'ok']);
} catch (Throwable $error) {
    error_log('Health check failed');
    http_response_code(503);
    echo json_encode(['status'=>'unavailable']);
}
