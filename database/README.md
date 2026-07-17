# Database

This folder contains a sample database schema and seed data for local setup and reference.

## Files

- **schema.sql** — full table structure (no data). Same schema created automatically by `isms-backend/src/init.js`, provided here for reference and for tools that prefer a raw SQL import.
- **seed_sample_data.sql** — sample `roles` and `employees` data (fictional/synthetic records for testing the CPF autocomplete, financial-year filtering, and asset workflows). Contains no real personal data.

## What's intentionally excluded

- `users` table data (login accounts, password hashes) — use `isms-backend/src/init.js` instead, which seeds three test accounts (E1/E2/E3) with known passwords documented in the main README
- `access_requests`, `audit_logs`, `assets` — these are generated as you use the app, not meant to be pre-seeded

## Usage

If you're setting up locally, the simplest path is still:

```bash
cd isms-backend
node src/init.js
```

This creates all tables and seeds the three test accounts automatically.

To additionally load the sample employee data for testing the CPF autocomplete:

```bash
psql -U postgres -h localhost -d isms_master -f database/seed_sample_data.sql
```
