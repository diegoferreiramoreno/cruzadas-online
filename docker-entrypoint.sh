#!/bin/sh
set -e

echo "==> [Cruzadas.online Docker] Generating vocabulary buckets..."
npm run generate:vocabulary

echo "==> [Cruzadas.online Docker] Generating challenge registry..."
npm run generate:registry

echo "==> [Cruzadas.online Docker] Applying local Cloudflare D1 migrations..."
npx wrangler d1 migrations apply DB --local

echo "==> [Cruzadas.online Docker] Executing main command: $@"
exec "$@"
