# Cloudflare D1 Provisioning and Migration Workflow

## Local Development (Default)
Local development and automated integration tests run against a local SQLite simulation maintained by Wrangler.
To apply migrations locally without connecting to Cloudflare servers:

```bash
npx wrangler d1 migrations apply cruzadas-telemetry-d1 --local
```

## Remote Production Provisioning (When Deploying)
When deploying to production with authenticated Cloudflare credentials:

1. Create or look up the D1 database:
   ```bash
   npx wrangler d1 create cruzadas-telemetry-d1
   ```
2. Copy the resulting `database_id` into `wrangler.jsonc`:
   ```jsonc
   "database_id": "<REAL_CLOUDFLARE_UUID>"
   ```
3. Apply remote migrations:
   ```bash
   npx wrangler d1 migrations apply cruzadas-telemetry-d1 --remote
   ```
