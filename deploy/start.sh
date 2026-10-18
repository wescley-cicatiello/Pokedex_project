#!/bin/sh
set -eu
php scripts/seed.php
exec apache2-foreground
