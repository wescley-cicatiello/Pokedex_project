<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/../src/database.php';
try {
    $count = (int) database()->query('SELECT COUNT(*) FROM pokemon')->fetchColumn();
    if ($count !== 151) throw new RuntimeException('Catálogo incompleto');
    if ((int)database()->query("SELECT COUNT(*) FROM pokemon_profiles WHERE reference='letsgo'")->fetchColumn() !== 151) throw new RuntimeException('Perfis incompletos');
    if (!database()->query("SELECT 1 FROM game_datasets WHERE reference='letsgo'")->fetchColumn()) throw new RuntimeException('Mundo incompleto');
    require __DIR__.'/../src/games.php';
    $counts=database()->query('SELECT version,COUNT(*) AS total FROM version_pokemon GROUP BY version')->fetchAll(PDO::FETCH_KEY_PAIR);
    foreach(games()['versions'] as $version=>$info)if((int)($counts[$version]??0)!==$info['count'])throw new RuntimeException('Catálogo de edição incompleto');
    echo json_encode(['status'=>'ok']);
} catch (Throwable $error) {
    error_log('Health check failed');
    http_response_code(503);
    echo json_encode(['status'=>'unavailable']);
}
