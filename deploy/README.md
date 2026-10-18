# Publicação gratuita: Render + Neon

O site mantém PHP e PostgreSQL. `Dockerfile.production` usa Apache; o Dockerfile original continua disponível para desenvolvimento local. Os planos têm limites de uso e o Render Free pausa por inatividade.

## 1. GitHub

Crie um repositório (pode ser privado) e envie os arquivos deste projeto, incluindo `render.yaml`. Não envie `.env`, senhas ou URLs de conexão. Nenhuma credencial real está nos arquivos de configuração.

## 2. Neon

1. Crie sua conta em https://console.neon.tech e selecione o plano **Free**.
2. Crie um projeto PostgreSQL chamado `pokedex`, preferencialmente na mesma região do serviço Render.
3. Em **Connect**, copie a connection string PostgreSQL com SSL. O formato é `postgresql://USUARIO:SENHA@HOST/BANCO?sslmode=require`.
4. Guarde essa URL: ela será preenchida **somente no campo secreto DATABASE_URL do Render**, nunca no GitHub nem no chat.

## 3. Render

1. Crie sua conta em https://dashboard.render.com usando o GitHub.
2. Escolha **New → Blueprint**, conecte o repositório e selecione `render.yaml`.
3. Confirme que o serviço está no plano **Free**. Não adicione PostgreSQL do Render.
4. No campo **DATABASE_URL**, cole a connection string do Neon.
5. Inicie a implantação. A aplicação cria a tabela e importa os 151 Pokémon automaticamente.
6. Quando o serviço estiver **Live**, abra a URL `https://NOME.onrender.com` fornecida pelo Render. O subdomínio e o HTTPS são fornecidos pela plataforma.

Alternativa manual: **New → Web Service → repositório → Docker**, Dockerfile `./Dockerfile.production`, plano Free, variável `PORT=10000`, `DATABASE_URL` com a string Neon e Health Check Path `/health.php`.

## Conferência

- `/health.php` retorna `{"status":"ok"}` após a importação.
- Abra a Pokédex e clique em um Pokémon.
- Abra o mapa, uma cidade e uma rota.
- Alterne entre Let’s Go e os dados anteriores.

O Render gratuito pode levar cerca de um minuto para abrir após 15 minutos sem acesso. O PostgreSQL gratuito do Render expira em 30 dias; por isso usamos Neon. Acompanhe as cotas dos planos gratuitos e não habilite upgrades pagos. Não há domínio próprio incluído; use o endereço `onrender.com`.

Fontes: https://render.com/docs/free · https://render.com/docs/blueprint-spec · https://neon.com/pricing
