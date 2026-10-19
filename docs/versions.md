# Edições suportadas

A raiz `/` permite escolher quatro grupos. A página anterior permanece em `/inicio.php`. A edição exata é transmitida em `?version=...` nos links e APIs; um cookie serve como preferência para acessos sem parâmetro. Abas com versões explícitas não interferem umas nas outras.

| Jogos | Catálogo completo | Regional |
| --- | ---: | ---: |
| Red, Blue internacional, Yellow, Green japonês | 151 | 151 |
| Gold, Silver, Crystal | 251 | 251 |
| FireRed, LeafGreen | 386 | 151 |
| HeartGold, SoulSilver | 493 | 256 |
| Let’s Go, Pikachu! / Eevee! | 153 | 153 |

Catálogo significa espécies aceitas pelo jogo, incluindo evoluções, trocas, transferências e eventos históricos. Não significa que todas sejam capturáveis ou possam ser obtidas atualmente sem outros jogos/acessórios. Meltan e Melmetal são transferidos de GO. Formas de Alola, Mega Evoluções e atributos dos parceiros de Let’s Go ficam nos detalhes da espécie. Formas cosméticas não são entradas separadas. Deoxys exibe a forma Ataque em FireRed e Defesa em LeafGreen.

## Dados e preservação

`data/games.json` declara grupos e edições. `version_pokemon`, `game_versions` e `version_atlases` são tabelas adicionais no PostgreSQL, separadas das tabelas anteriores. `pokemon`, `pokemon_profiles` e `game_datasets` permanecem disponíveis. `/api.php?reference=legacy` conserva a API anterior. O seed é transacional e idempotente e utiliza a conexão direta para migração e inserções em lote.

`data/versions/*.json` contém catálogos e atlas importáveis sem acesso à internet no build. A fonte é o [repositório oficial da PokéAPI](https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv): Pokémon, atributos anteriores, tipos anteriores, habilidades anteriores, números regionais e encontros. Os registros históricos se aplicam até a geração indicada na tabela. A geração I usa Especial único; habilidades começam na geração III; tipos Fada não aparecem nos jogos antigos. As artes das espécies são ilustrações de referência, não sprites históricos de cada jogo.

Green usa o conjunto de encontros do Blue internacional, baseado no Green japonês ([referência](https://www.serebii.net/rb/greenblue.shtml)); a PokéAPI não oferece uma edição Green independente. Essa equivalência está indicada no atlas, sem reivindicar cobertura de diferenças de presentes/trocas ou do Blue japonês.

Para preparar os arquivos novamente:

```sh
node scripts/fetch-version-data.mjs
node scripts/prepare-letsgo.mjs
node scripts/prepare-versions.mjs
node scripts/validate-versions.mjs
npm run build
```

O cache de download não entra no Git nem na imagem Docker. Para atualizar as fontes, remova apenas os CSV do cache e baixe novamente; revise o diff dos arquivos gerados antes de publicar.

## Mapas

Let’s Go mantém o mapa ilustrado, imagens, pontos de interesse, ginásios e Liga já existentes. As outras edições têm um atlas pesquisável de áreas de encontro da PokéAPI, incluindo Johto e Ilhas Sevii nos jogos correspondentes. As áreas mostram níveis mínimos/máximos e métodos agregados; algumas aparições dependem de horário, rádio, enxames, evento ou progresso. O atlas não representa todos os presentes, trocas, evoluções ou transferências. Não foram copiados ginásios, fotos ou equipes de Let’s Go para jogos antigos; mapas ilustrados e guias de treinadores dessas edições ainda precisam de conteúdo específico.

`npm run test:neon` valida todas as edições através do PHP e PostgreSQL, o isolamento por parâmetro/cookie, os tipos, o mundo de Let’s Go e as páginas. Defina `TEST_BASE_URL` para executar a mesma verificação após publicar.
