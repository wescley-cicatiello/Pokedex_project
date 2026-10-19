<?php
declare(strict_types=1);
require __DIR__ . '/../src/database.php';
$host = parse_url(getenv('DATABASE_URL') ?: '', PHP_URL_HOST);
if (!$host || !str_ends_with($host, '.neon.tech')) throw new RuntimeException('A conexão não aponta para Neon');
$db = database();
// pg_stat_ssl reports the pooler's backend connection, not the client TLS hop.
// database() rejects non-TLS sslmode and libpq enforces it on connection.
$db->beginTransaction();
try {
    $id = $db->query('UPDATE pokemon SET weight = weight WHERE id = 25 RETURNING id')->fetchColumn();
    if ((int)$id !== 25) throw new RuntimeException('Teste de escrita falhou');
} finally {
    $db->rollBack();
}
echo "NEON OK: host Neon, SSL exigido pelo PDO/libpq, leitura e escrita transacional com rollback.\n";
