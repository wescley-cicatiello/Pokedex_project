<?php
require __DIR__.'/../src/games.php';
require __DIR__.'/../src/map-world.php';
foreach(games()['versions'] as $version=>$info){
    if($info['group']==='letsgo')continue;
    $dataset=json_decode(file_get_contents(__DIR__.'/../data/versions/'.$version.'.json'),true,512,JSON_THROW_ON_ERROR);
    $world=buildMapWorld($version,$dataset['atlas'],$dataset['profiles']);
    $expected=$info['group']==='frlg'?4:($info['group']==='johto'?2:1);
    if(count($world['maps'])!==$expected)throw new RuntimeException('Mapas incompletos: '.$version);
    if(count($world['league'])!==5)throw new RuntimeException('Liga incompleta: '.$version);
    $ids=[];
    foreach($world['locations'] as $location){
        if(isset($ids[$location['id']]))throw new RuntimeException('Marcador duplicado: '.$location['id']);$ids[$location['id']]=true;
        if($location['mapId']!=='special'&&($location['x']<0||$location['x']>100||$location['y']<0||$location['y']>100))throw new RuntimeException('Coordenada inválida: '.$location['name']);
    }
    foreach($world['cities'] as $city)if(isset($city['gym'])){if(!$city['gym']['team'])throw new RuntimeException('Equipe ausente');if(!is_file(__DIR__.'/../public'.$city['gym']['portrait']))throw new RuntimeException('Retrato ausente');}
    if($info['group']==='johto'&&($world['cities']['fuchsia']['gym']['leader']!=='Janine'||$world['cities']['viridian']['gym']['leader']!=='Blue'||$world['cities']['seafoam']['gym']['leader']!=='Blaine'))throw new RuntimeException('Ginásios de Johto inconsistentes');
    $routes=array_filter($world['locations'],fn($l)=>$l['name']==='Route 1');$route=array_values($routes)[0];if(!$world['encounters'][$route['id']])throw new RuntimeException('Encontros da rota 1 ausentes');
    echo $version.': '.count($world['maps']).' mapas, '.count($world['locations'])." locais, 5 treinadores da Liga OK.\n";
}
