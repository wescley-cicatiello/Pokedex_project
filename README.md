# Pokédex · Kanto

## Alinhamento exclusivo com Let’s Go

O site usa exclusivamente Pokémon Let’s Go nas telas. O seletor global alterna Pikachu/Eevee e desconsidera antigas preferências de jogos clássicos. A Pokédex e a página de tipos consultam `pokemon_profiles`; o mapa consulta `/world.php`, com cidades, encontros, equipes de ginásio e Liga armazenados em `game_datasets` no PostgreSQL. O catálogo permanece limitado às 151 formas comuns originais, com estatísticas dos parceiros Pikachu/Eevee adicionais; não é uma listagem de todas as formas e espécies extras disponíveis nos jogos.

`pokemon` e os arquivos clássicos foram preservados; `/api.php?reference=legacy` mantém compatibilidade para consulta histórica e não é utilizado pelas telas. `scripts/prepare-letsgo.mjs` prepara os dados de importação, e `scripts/seed.php` atualiza as novas tabelas transacionalmente sem excluir os registros anteriores. Os encontros ainda não cobrem todos os presentes/trocas e mantêm indicação de aparições especiais.

As seções abaixo registram a evolução do projeto; esta seção descreve o comportamento atual.

## Neon conectado

`neon.ts` declara apenas PostgreSQL no projeto `wispy-wave-94405045`, branch `production`. O CLI grava `.env.local` (ou `.env` existente), ignorado pelo Git e pelo Docker. O PHP preserva PDO/pdo_pgsql: `DATABASE_URL` para consultas com pool; `DATABASE_URL_UNPOOLED` para o esquema e importação. Não copie credenciais para código ou mensagens.

```sh
neon deploy
npm run build
npm start
npm run test:neon
```

`npm start` abre o site em `http://localhost:8002` usando o banco Neon. Requer Node.js, npm e Docker Desktop. `npm run build` valida JavaScript, constrói PHP/Apache e verifica sintaxe PHP. `npm run test:neon` testa a saúde do banco, os 151 registros, a API padrão e anterior e as quatro páginas. O site local anterior continua em `localhost:8000`. Para encerrar o servidor Neon local: `docker stop pokedex-neon`.

As skills Neon ficam em `.agents/skills`; o `neon init` instalou a integração/plugin Neon para Codex e configurou MCP com OAuth para os agentes detectados. Pode ser necessário reconectar o agente para usar as novas ferramentas MCP. O Neon não publica este frontend PHP; mantenha Render como hospedagem do aplicativo e preencha as mesmas variáveis na plataforma.

Para publicar gratuitamente com PHP e PostgreSQL, siga [o guia de Render + Neon](deploy/README.md). A configuração está em `render.yaml` e `Dockerfile.production`; o ambiente local continua usando `compose.yaml`.

## Referência padrão: Pokémon Let’s Go

O seletor no topo de todas as páginas usa Let’s Go por padrão e permite voltar aos dados anteriores. A preferência fica salva neste navegador. A API `/api.php` usa Let’s Go; `/api.php?reference=legacy` mantém habilidades e estatísticas anteriores. O PostgreSQL original é preservado.

- Pokédex: 151 formas comuns de Kanto, com estatísticas base conferidas contra Pokémon Showdown. Let’s Go não utiliza habilidades; as anteriores seguem disponíveis em uma seção expansível. Pikachu e Eevee também mostram estatísticas dos parceiros iniciais. O catálogo principal mantém o escopo original: não inclui Meltan, Melmetal, formas de Alola ou Megaevoluções.
- Mapa: `letsgo-encounters.json` adiciona encontros de Pikachu/Eevee, com aparições especiais e no céu identificadas. Existem condições de combo e pós-jogo; a lista não representa disponibilidade imediata e não inclui todos os presentes/trocas. O arquivo original `location-encounters.json` mantém Red/Blue/Yellow. Importação: `node scripts/fetch-letsgo-encounters.mjs`.
- Ginásios: equipes iniciais de Let’s Go como padrão (`letsgo-gyms.js`); equipes Red/Blue e pontos antigos preservados em `kanto-cities.js`. Fuchsia mostra GO Park no modo Let’s Go.
- Liga: continua usando o primeiro desafio de Let’s Go, identificado na janela.

Referências da revisão: [ginásios](https://www.serebii.net/letsgopikachueevee/gyms.shtml), [mecânicas](https://www.serebii.net/letsgopikachueevee/mechanics.shtml), [parceiros](https://www.serebii.net/letsgopikachueevee/exclusives.shtml) e URLs por local salvas no arquivo de encontros. `data/letsgo-audit.json` registra a conferência de estatísticas. As seções históricas abaixo documentam as etapas anteriores; esta seção define o comportamento atual.

Pokédex em português com os **151 Pokémon da primeira geração**, PHP 8.3 e PostgreSQL 16. Interface responsiva, busca por nome ou número, filtro por tipo, ordenação e detalhes com medidas, habilidades e estatísticas.

## Rodar com Docker

1. Instale e abra o Docker Desktop com suporte a containers Linux.
2. Na pasta deste projeto, execute:

```sh
docker compose up --build -d
```

3. Abra http://localhost:8000.

O PostgreSQL passa pelo healthcheck antes de iniciar o PHP. A aplicação cria a tabela e importa os 151 registros automaticamente. A importação pode ser repetida sem duplicar registros. Os dados persistem no volume `postgres_data`.

Para parar: `docker compose down`. Para acompanhar erros: `docker compose logs app`.

## Rodar sem Docker

Requisitos: PHP 8.3+ com `pdo_pgsql` e PostgreSQL. Crie o banco `pokedex` e um usuário com permissão de criar tabelas. Configure as variáveis de ambiente `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD` no terminal. Os valores locais padrão estão em `src/database.php`. O arquivo `.env` é usado pelo Docker Compose; a execução direta de PHP usa as variáveis do processo.

```sh
php scripts/seed.php
php -S localhost:8000 -t public
```

Use **public/** como raiz pública do servidor para manter scripts, configuração e dados fora do acesso HTTP. O servidor embutido do PHP serve para desenvolvimento. Em produção, use PHP-FPM com Nginx/Apache, HTTPS e credenciais próprias.

## Estrutura

Os líderes têm retratos oficiais de Let’s Go, salvos em `public/assets/trainers/`, com origens em `sources.json`. O Indigo Plateau apresenta Lorelei, Bruno, Agatha, Lance e o Campeão Trace, com equipes do primeiro desafio de Let’s Go e seletor Pikachu/Eevee para a variação do Campeão ([referência](https://www.serebii.net/letsgopikachueevee/elitefour.shtml)). As equipes de ginásio continuam sendo de Red/Blue, conforme indicado na interface. Para baixar novamente as artes: `node scripts/fetch-trainer-images.mjs`.

Nas cidades, a janela apresenta pontos de interesse e ginásios em lugar dos encontros. As oito equipes de líderes, incluindo níveis e repetições, correspondem à primeira batalha em Red/Blue ([referência](https://www.serebii.net/rb/gyms.shtml)), e estão em `public/assets/kanto-cities.js`. Os pontos de interesse também usam os jogos originais como referência; por exemplo, Fuchsia apresenta a Safari Zone. Pallet e Lavender não possuem ginásio.

As janelas do mapa mostram Pokémon obtidos nos locais em Red, Blue e Yellow, com filtro por jogo e métodos de obtenção. Os dados da PokéAPI incluem encontros, presentes e trocas cadastrados, mas não equipes de treinadores. A arte do mapa e as imagens dos locais são de Let’s Go; o GO Park não tem encontros nos jogos originais. Para atualizar os registros: `node scripts/fetch-encounters.mjs` (Node 18+); as respostas são armazenadas em cache local ignorado pelo Git. O arquivo público `public/assets/location-encounters.json` acompanha o projeto.

A página inicial (`/`) oferece acesso à Pokédex (`/pokedex.php`), aos tipos (`/tipos.php`) e à seção Sobre. Escolher um tipo abre o catálogo com o filtro correspondente.

- `public/`: página, API JSON e assets da interface.
- `src/database.php`: conexão PostgreSQL via PDO.
- `database/schema.sql`: esquema do banco.
- `scripts/seed.php`: importação transacional dos dados.
- `data/pokemon.json`: catálogo completo versionado; nenhuma consulta à PokéAPI é necessária durante a navegação.
- `scripts/fetch-data.mjs`: atualização opcional do catálogo com Node.js 18+ (`node scripts/fetch-data.mjs`). Após atualizar, execute a importação novamente.

Dados e imagens: [PokéAPI](https://pokeapi.co/docs/v2/) e seu [repositório de sprites](https://github.com/PokeAPI/sprites). As imagens e as fontes do Google Fonts precisam de internet. O catálogo usa tipos e estatísticas atuais das espécies #001–#151, incluindo alterações de gerações posteriores. As habilidades conservam seus nomes em inglês. Projeto de fã, sem afiliação com Nintendo, Game Freak ou The Pokémon Company.
