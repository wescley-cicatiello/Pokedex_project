<?php
declare(strict_types=1);
function games(): array {
    static $config;
    return $config ??= json_decode(file_get_contents(__DIR__.'/../data/games.json'), true, 512, JSON_THROW_ON_ERROR);
}
function selectedVersion(): string {
    static $selected;
    if($selected!==null)return $selected;
    $version = $_GET['version'] ?? $_COOKIE['pokemon-version'] ?? 'lets-go-pikachu';
    if (!is_string($version) || !isset(games()['versions'][$version])) {
        http_response_code(400);
        exit('Edição de Pokémon inválida.');
    }
    if (isset($_GET['version'])) setcookie('pokemon-version', $version, ['expires'=>time()+31536000,'path'=>'/','secure'=>!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']!=='off','httponly'=>true,'samesite'=>'Lax']);
    return $selected=$version;
}
function gameContext(): array {
    $version=selectedVersion();
    return ['version'=>$version, 'game'=>games()['versions'][$version], 'catalog'=>games()];
}
function gameScript(): void {
    echo '<script>window.gameContext='.json_encode(gameContext(), JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT).';</script>';
}
function versionProfiles(PDO $db, string $version): array {
    $query=$db->prepare('SELECT data FROM version_pokemon WHERE version=? ORDER BY pokemon_id');
    $query->execute([$version]);
    $profiles=array_map(fn($row)=>json_decode($row,true,512,JSON_THROW_ON_ERROR),$query->fetchAll(PDO::FETCH_COLUMN));
    if(count($profiles)!==games()['versions'][$version]['count']) throw new RuntimeException('Importação da edição incompleta');
    return $profiles;
}
