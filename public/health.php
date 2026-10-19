<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/../src/database.php';
try {
    // One connection and one round trip keep the check within Render's five-second limit.
    $status=database()->query("SELECT
        (SELECT COUNT(*) FROM pokemon) AS legacy_count,
        (SELECT COUNT(*) FROM pokemon_profiles WHERE reference='letsgo') AS profile_count,
        EXISTS(SELECT 1 FROM game_datasets WHERE reference='letsgo') AS has_world,
        (SELECT jsonb_object_agg(version,total) FROM (SELECT version,COUNT(*) AS total FROM version_pokemon GROUP BY version) AS counts) AS versions")->fetch(PDO::FETCH_ASSOC);
    if ((int)$status['legacy_count'] !== 151) throw new RuntimeException('Catálogo incompleto');
    if ((int)$status['profile_count'] !== 151) throw new RuntimeException('Perfis incompletos');
    if (!$status['has_world']) throw new RuntimeException('Mundo incompleto');
    require __DIR__.'/../src/games.php';
    $counts=json_decode($status['versions']??'{}',true,512,JSON_THROW_ON_ERROR);
    foreach(games()['versions'] as $version=>$info)if((int)($counts[$version]??0)!==$info['count'])throw new RuntimeException('Catálogo de edição incompleto');
    echo json_encode(['status'=>'ok']);
} catch (Throwable $error) {
    error_log('Health check failed');
    http_response_code(503);
    echo json_encode(['status'=>'unavailable']);
}
