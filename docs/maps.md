# Mapas interativos por edição

Todas as 13 edições usam `/mapa.php?version=...`, com seleção de região, busca, filtros de categoria, zoom e janelas acessíveis por mouse, teclado ou seletor de local.
Marcadores próximos são afastados automaticamente conforme a largura e o zoom, com uma linha discreta indicando a posição original, para evitar que o toque abra o ponto vizinho em telas menores. As coordenadas de referência permanecem preservadas.

| Edições | Mapas |
| --- | --- |
| Red / Blue internacional / Yellow / Green japonês | Kanto, Town Map da geração I |
| FireRed / LeafGreen | Kanto ilustrado; Sevii 1–3, 4–5 e 6–7 |
| Gold / Silver / Crystal | Johto e Kanto, Town Maps da geração II |
| HeartGold / SoulSilver | Johto e Kanto, artes dos remakes |
| Let’s Go Pikachu / Eevee | Mapa ilustrado já existente |

As imagens locais e suas fontes estão em `public/assets/maps/sources.json`. As imagens pequenas originais são ampliadas com `image-rendering: pixelated`, preservando o desenho dos jogos. As coordenadas percentuais pertencem a cada imagem, sem reaproveitar as posições de Let’s Go em outra arte. Em GSC, a referência de coordenadas é [pret/pokecrystal, landmarks.asm](https://github.com/pret/pokecrystal/blob/master/data/maps/landmarks.asm), com ajuste para a origem do recorte do mapa. Os demais mapas foram calibrados visualmente sobre suas respectivas imagens.

`data/map-layouts.json` guarda os pontos; `data/map-cities.json` e `data/map-leagues.json` guardam serviços, ginásios e as equipes do primeiro desafio. As referências de ginásios e Liga são as páginas correspondentes de Red/Blue, Yellow, FireRed/LeafGreen, Gold/Silver e HeartGold/SoulSilver no Serebii. Os sprites/retratos dos treinadores são locais, com manifesto de origem em `public/assets/trainers/maps/sources.json`. Nenhuma equipe de Let’s Go é reutilizada nos outros jogos. As equipes alternativas de Blue são selecionáveis e identificadas como variantes do rival, não batalhas consecutivas.

`src/map-world.php` junta esses pontos com as áreas de encontro de `version_atlases` e os perfis de `version_pokemon` no PostgreSQL. Não há alteração de esquema nem cópia destrutiva de dados nesta atualização. O mundo de Let’s Go continua em `game_datasets`. O endpoint `/world.php` agora atende todas as edições. O atlas original continua acessível pela API.

As cidades mostram pontos de interesse e ginásios, sem lista de capturas. Nas rotas e demais locais, é possível escolher um andar/área e consultar métodos e níveis agregados. Cada link para a Pokédex conserva a edição selecionada. Imagens individuais de localidades de Let’s Go não são exibidas como imagens de outros jogos.

Diferenças de disponibilidade são respeitadas: Battle Tower apenas em Crystal dentro da geração II; Safari Zone de Johto, rotas 47/48, Embedded Tower e Battle Frontier apenas nos remakes; Janine, Blue e Blaine nas Seafoam Islands nos jogos de Johto. Lugares apagados de GSC não são adicionados como cavernas acessíveis.

Ilhas de eventos, encontros itinerantes e áreas sem posição própria na imagem aparecem em **Outros locais e eventos**, abrindo a mesma janela flutuante. Não são colocados em coordenadas geográficas inventadas. Registros técnicos da fonte, como `Unknown; all bugs` e `johto-pokemart`, não se tornam destinos fictícios. O acesso a eventos históricos depende das condições descritas no jogo; o mapa não implica que novos tickets possam ser obtidos atualmente.

## Atualização das fontes

```sh
node scripts/fetch-region-maps.mjs
node scripts/fetch-map-references.mjs
node scripts/prepare-map-layouts.mjs
node scripts/prepare-map-gyms.mjs
node scripts/prepare-map-league.mjs
node scripts/fetch-map-portraits.mjs
npm run build
npm run test:neon
```

Os arquivos preparados são versionados; o build e o Render não precisam baixar mapas ou consultar Serebii/Bulbagarden. O build valida limites das coordenadas, IDs únicos, equipes e retratos. Os testes HTTP verificam os mapas das 13 edições e as diferenças entre gerações. As verificações no navegador cobrem mudança de região, filtros, zoom, abertura e fechamento das janelas e links para a Pokédex.
