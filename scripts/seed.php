<?php
declare(strict_types=1);
require __DIR__ . '/../src/database.php';
$items = json_decode(file_get_contents(__DIR__ . '/../data/pokemon.json'), true, 512, JSON_THROW_ON_ERROR);
if (count($items) !== 151) throw new RuntimeException('O catálogo precisa conter os 151 Pokémon.');
$db = database(true);
$db->beginTransaction();
try {
    $db->exec(file_get_contents(__DIR__ . '/../database/schema.sql'));
    $query = $db->prepare('INSERT INTO pokemon (id,name,types,height,weight,abilities,stats,image) SELECT id,name,types,height,weight,abilities,stats,image FROM jsonb_to_recordset(?::jsonb) AS p(id smallint,name varchar(40),types jsonb,height numeric,weight numeric,abilities jsonb,stats jsonb,image text) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,types=EXCLUDED.types,height=EXCLUDED.height,weight=EXCLUDED.weight,abilities=EXCLUDED.abilities,stats=EXCLUDED.stats,image=EXCLUDED.image');
    $query->execute([json_encode($items,JSON_THROW_ON_ERROR)]);
    $profiles = json_decode(file_get_contents(__DIR__ . '/../data/pokemon-letsgo.json'), true, 512, JSON_THROW_ON_ERROR);
    if (count($profiles) !== 151) throw new RuntimeException('Perfis Let’s Go incompletos');
    $profileQuery = $db->prepare("INSERT INTO pokemon_profiles (pokemon_id,reference,data) SELECT (entry->>'id')::smallint,'letsgo',entry FROM jsonb_array_elements(?::jsonb) AS entry ON CONFLICT (pokemon_id,reference) DO UPDATE SET data=EXCLUDED.data");
    $profileQuery->execute([json_encode($profiles,JSON_THROW_ON_ERROR)]);
    $world = file_get_contents(__DIR__ . '/../data/world-letsgo.json');
    json_decode($world, true, 512, JSON_THROW_ON_ERROR);
    $db->prepare("INSERT INTO game_datasets (reference,data) VALUES ('letsgo',?) ON CONFLICT (reference) DO UPDATE SET data=EXCLUDED.data")->execute([$world]);
    $games=json_decode(file_get_contents(__DIR__.'/../data/games.json'),true,512,JSON_THROW_ON_ERROR);
    $versionQuery=$db->prepare('INSERT INTO game_versions(version,data) VALUES (?,?) ON CONFLICT(version) DO UPDATE SET data=EXCLUDED.data');
    $bulk=$db->prepare("INSERT INTO version_pokemon(version,pokemon_id,data) SELECT ?, (entry->>'id')::smallint, entry FROM jsonb_array_elements(?::jsonb) AS entry ON CONFLICT(version,pokemon_id) DO UPDATE SET data=EXCLUDED.data");
    $atlasQuery=$db->prepare('INSERT INTO version_atlases(version,data) VALUES (?,?) ON CONFLICT(version) DO UPDATE SET data=EXCLUDED.data');
    foreach($games['versions'] as $version=>$info){
        $dataset=json_decode(file_get_contents(__DIR__.'/../data/versions/'.$version.'.json'),true,512,JSON_THROW_ON_ERROR);
        if(count($dataset['profiles'])!==$info['count'])throw new RuntimeException('Catálogo incompleto: '.$version);
        $versionQuery->execute([$version,json_encode($info,JSON_THROW_ON_ERROR)]);
        $bulk->execute([$version,json_encode($dataset['profiles'],JSON_THROW_ON_ERROR)]);
        $atlasQuery->execute([$version,json_encode($dataset['atlas'],JSON_THROW_ON_ERROR)]);
        echo $version.': '.count($dataset['profiles'])." perfis importados.\n";
    }
    $db->commit();
    echo "151 Pokémon preservados; 151 perfis e mundo Let’s Go importados.\n";
} catch (Throwable $error) {
    $db->rollBack();
    throw $error;
}
