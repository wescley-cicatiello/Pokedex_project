<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/../src/database.php';
require __DIR__.'/../src/games.php';
try {
    $db=database();$version=selectedVersion();
    if(games()['versions'][$version]['group']!=='letsgo'){
        require __DIR__.'/../src/map-world.php';
        $query=$db->prepare('SELECT data FROM version_atlases WHERE version=?');$query->execute([$version]);$atlas=$query->fetchColumn();
        if(!$atlas)throw new RuntimeException('Atlas não importado');
        $profiles=$db->prepare("SELECT pokemon_id AS id,data->>'name' AS name,data->>'image' AS image FROM version_pokemon WHERE version=? ORDER BY pokemon_id");$profiles->execute([$version]);
        echo json_encode(buildMapWorld($version,json_decode($atlas,true,512,JSON_THROW_ON_ERROR),$profiles->fetchAll(PDO::FETCH_ASSOC)),JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);exit;
    }
    $data = $db->query("SELECT data FROM game_datasets WHERE reference='letsgo'")->fetchColumn();
    if (!$data) throw new RuntimeException('Mundo Let’s Go não importado');
    $world=json_decode($data,true,512,JSON_THROW_ON_ERROR);
    $world['version']=$version;
    $world['maps']=[['id'=>'kanto-letsgo','label'=>'Kanto','image'=>'/assets/kanto.jpg','pixelated'=>false,'source'=>'https://www.nintendo.com/au/games/nintendo-switch/pokemon-lets-go-pikachu/']];
    foreach($world['locations'] as &$point){$point['mapId']='kanto-letsgo';$point['image']='/assets/locations/'.$point['id'].'.png';}unset($point);
    echo json_encode($world,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
} catch (Throwable $error) {
    error_log($error->getMessage());
    http_response_code(503);
    echo json_encode(['error'=>'Não foi possível carregar os dados do mapa. Tente novamente.']);
}
