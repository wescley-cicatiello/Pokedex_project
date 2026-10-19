<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/../src/database.php';
try {
    $data = database()->query("SELECT data FROM game_datasets WHERE reference='letsgo'")->fetchColumn();
    if (!$data) throw new RuntimeException('Mundo Let’s Go não importado');
    echo $data;
} catch (Throwable $error) {
    error_log($error->getMessage());
    http_response_code(503);
    echo json_encode(['error'=>'Não foi possível carregar os dados de Let’s Go. Tente novamente.']);
}
