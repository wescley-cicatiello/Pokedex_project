<?php
 declare(strict_types=1);
 $labels = ['normal'=>'Normal','fire'=>'Fogo','water'=>'Água','electric'=>'Elétrico','grass'=>'Planta','ice'=>'Gelo','fighting'=>'Lutador','poison'=>'Veneno','ground'=>'Terra','flying'=>'Voador','psychic'=>'Psíquico','bug'=>'Inseto','rock'=>'Pedra','ghost'=>'Fantasma','dragon'=>'Dragão','steel'=>'Aço','fairy'=>'Fada'];
 require __DIR__ . '/../src/database.php';
 $records = database()->query("SELECT data FROM pokemon_profiles WHERE reference='letsgo' ORDER BY pokemon_id")->fetchAll(PDO::FETCH_COLUMN);
 $pokemon = array_map(fn($record)=>json_decode($record,true,512,JSON_THROW_ON_ERROR),$records);
 $counts = [];
 foreach ($pokemon as $item) foreach ($item['types'] as $type) $counts[$type] = ($counts[$type] ?? 0) + 1;
?>
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Tipos Pokémon — Pokédex</title><link rel="stylesheet" href="/assets/style.css?v=letsgo-db-1"><script src="/assets/site-version.js?v=letsgo-db-1"></script></head><body>
<header class="topbar"><a href="/" class="brand"><span class="pokeball"></span>pokédex.</a><nav class="site-nav" aria-label="Navegação principal"><a href="/">Início</a><a href="/pokedex.php">Pokédex</a><a href="/tipos.php" aria-current="page">Tipos</a><a href="/mapa.php">Mapa</a></nav></header>
<main><section class="page-intro"><a class="back-link" href="/">← Voltar ao início</a><span class="eyebrow">CADA POKÉMON, UMA DESCOBERTA</span><h1>Qual é o seu <em>tipo?</em></h1><p>Escolha um tipo para ver seus Pokémon na Pokédex.</p><p>Tipos das formas comuns em Pokémon Let&#39;s Go. Pokémon com dois tipos aparecem em ambos os grupos.</p></section><section class="type-grid" aria-label="Tipos Pokémon">
<?php foreach ($labels as $type => $label): if (!isset($counts[$type])) continue; ?>
<a class="type-tile <?= $type ?>-card" href="/pokedex.php?type=<?= $type ?>"><span class="badge <?= $type ?>"><?= $label ?></span><h2><?= $label ?></h2><p><?= $counts[$type] ?> Pokémon ↗</p></a>
<?php endforeach; ?></section><footer><a href="/" class="brand"><span class="pokeball"></span>pokédex.</a><p>Feito para quem nunca deixou de explorar.</p><span>Projeto de fã · Pokémon © Nintendo / Game Freak</span></footer></main></body></html>
