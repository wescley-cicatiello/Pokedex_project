<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
require __DIR__.'/../src/database.php';
require __DIR__.'/../src/games.php';
try {
    $query=database()->prepare('SELECT data FROM version_atlases WHERE version=?');
    $query->execute([selectedVersion()]);
    $data=$query->fetchColumn();
    if(!$data)throw new RuntimeException('Atlas não importado');
    echo $data;
} catch(Throwable $error) {
    error_log($error->getMessage());http_response_code(503);
    echo json_encode(['error'=>'Não foi possível carregar o atlas. Tente novamente.']);
}
