<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/../src/database.php';
try {
    $rows = database()->query('SELECT * FROM pokemon ORDER BY id')->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as &$row) {
        $row['id'] = (int)$row['id'];
        foreach (['types','abilities','stats'] as $key) $row[$key] = json_decode($row[$key], true, 512, JSON_THROW_ON_ERROR);
        // Preserve the previous dataset; Let's Go does not use Abilities.
        $row['legacy'] = ['abilities'=>$row['abilities'], 'stats'=>$row['stats']];
        $row['reference'] = ($_GET['reference'] ?? '') === 'legacy' ? 'legacy' : 'letsgo';
        if ($row['reference'] === 'letsgo') $row['abilities'] = [];
        if ($row['reference'] === 'letsgo' && in_array($row['id'], [25,133], true)) {
            $values = $row['id'] === 25 ? [45,80,50,75,60,120] : [65,75,70,65,85,75];
            $row['partner_stats'] = array_map(fn($stat, $value) => ['name'=>$stat['name'],'value'=>$value], $row['stats'], $values);
        }
    }
    echo json_encode($rows, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
} catch (Throwable $error) {
    error_log($error->getMessage());
    http_response_code(503);
    echo json_encode(['error'=>'Não foi possível carregar a Pokédex. Verifique a conexão com o banco e execute a importação.']);
}
