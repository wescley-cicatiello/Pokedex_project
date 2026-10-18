<?php
declare(strict_types=1);
require __DIR__ . '/../src/database.php';
$items = json_decode(file_get_contents(__DIR__ . '/../data/pokemon.json'), true, 512, JSON_THROW_ON_ERROR);
if (count($items) !== 151) throw new RuntimeException('O catálogo precisa conter os 151 Pokémon.');
$db = database();
$db->beginTransaction();
try {
    $db->exec(file_get_contents(__DIR__ . '/../database/schema.sql'));
    $query = $db->prepare('INSERT INTO pokemon (id,name,types,height,weight,abilities,stats,image) VALUES (:id,:name,:types,:height,:weight,:abilities,:stats,:image) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,types=EXCLUDED.types,height=EXCLUDED.height,weight=EXCLUDED.weight,abilities=EXCLUDED.abilities,stats=EXCLUDED.stats,image=EXCLUDED.image');
    foreach ($items as $item) {
        foreach (['types','abilities','stats'] as $key) $item[$key] = json_encode($item[$key], JSON_THROW_ON_ERROR);
        $query->execute($item);
    }
    $db->commit();
    echo "151 Pokémon importados.\n";
} catch (Throwable $error) {
    $db->rollBack();
    throw $error;
}
