<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/../src/database.php';
try {
    $count = (int) database()->query('SELECT COUNT(*) FROM pokemon')->fetchColumn();
    if ($count !== 151) throw new RuntimeException('Catálogo incompleto');
    if ((int)database()->query("SELECT COUNT(*) FROM pokemon_profiles WHERE reference='letsgo'")->fetchColumn() !== 151) throw new RuntimeException('Perfis incompletos');
    if (!database()->query("SELECT 1 FROM game_datasets WHERE reference='letsgo'")->fetchColumn()) throw new RuntimeException('Mundo incompleto');
    echo json_encode(['status'=>'ok']);
} catch (Throwable $error) {
    error_log('Health check failed');
    http_response_code(503);
    echo json_encode(['status'=>'unavailable']);
}
