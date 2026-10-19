<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/../src/database.php';
require __DIR__.'/../src/games.php';
if(games()['versions'][selectedVersion()]['group']!=='letsgo'){
    http_response_code(400);echo json_encode(['error'=>'O mapa ilustrado é de Let’s Go. Consulte atlas-api.php para os encontros desta edição.']);exit;
}
try {
    $data = database()->query("SELECT data FROM game_datasets WHERE reference='letsgo'")->fetchColumn();
    if (!$data) throw new RuntimeException('Mundo Let’s Go não importado');
    echo $data;
} catch (Throwable $error) {
    error_log($error->getMessage());
    http_response_code(503);
    echo json_encode(['error'=>'Não foi possível carregar os dados de Let’s Go. Tente novamente.']);
}
