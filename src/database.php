<?php
declare(strict_types=1);
function database(): PDO {
    $url = getenv('DATABASE_URL');
    if ($url) {
        $parts = parse_url($url);
        if (!$parts || !in_array($parts['scheme'] ?? '', ['postgres','postgresql'], true) || empty($parts['host']) || empty($parts['path'])) {
            throw new RuntimeException('DATABASE_URL inválida');
        }
        parse_str($parts['query'] ?? '', $query);
        $host = $parts['host'];
        $name = rawurldecode(ltrim($parts['path'], '/'));
        // DSN values are deliberately constrained; credentials are passed separately.
        if (!preg_match('/^[a-zA-Z0-9.-]+$/', $host) || !preg_match('/^[a-zA-Z0-9_-]+$/', $name)) throw new RuntimeException('Host ou banco inválido');
        $ssl = $query['sslmode'] ?? 'require';
        if (!in_array($ssl, ['require','verify-ca','verify-full'], true)) throw new RuntimeException('DATABASE_URL exige SSL');
        $dsn = sprintf('pgsql:host=%s;port=%d;dbname=%s;sslmode=%s;connect_timeout=15', $host, $parts['port'] ?? 5432, $name, $ssl);
        return new PDO($dsn, rawurldecode($parts['user'] ?? ''), rawurldecode($parts['pass'] ?? ''), [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
    }
    return new PDO(sprintf('pgsql:host=%s;port=%s;dbname=%s', getenv('DB_HOST') ?: 'localhost', getenv('DB_PORT') ?: '5432', getenv('DB_NAME') ?: 'pokedex'), getenv('DB_USER') ?: 'pokedex', getenv('DB_PASSWORD') ?: 'pokedex_local', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
}
