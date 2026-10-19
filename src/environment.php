<?php
declare(strict_types=1);
// CLI Neon writes .env.local (or .env); process variables always take priority.
function loadEnvironment(): void {
    foreach (['.env.local', '.env'] as $filename) {
        $path = __DIR__ . '/../' . $filename;
        if (!is_file($path)) continue;
        foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) continue;
            if (str_starts_with($line, 'export ')) $line = substr($line, 7);
            if (!preg_match('/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/', $line, $parts)) continue;
            if (getenv($parts[1]) !== false) continue;
            $value = trim($parts[2]);
            if (strlen($value) >= 2 && (($value[0] === '"' && str_ends_with($value, '"')) || ($value[0] === "'" && str_ends_with($value, "'")))) $value = substr($value, 1, -1);
            putenv($parts[1] . '=' . $value);
        }
    }
}
loadEnvironment();
