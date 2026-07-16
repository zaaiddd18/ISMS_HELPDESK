# ISMS Helpdesk

An internal Information Security Management System (ISMS) helpdesk for managing user access requests, asset inventory, and audit logging — aligned with ISO/IEC 27001:2022 practices.

## What it does

- **Access request workflow** — employees submit user creation/deletion requests via a CPF-based lookup; a designated approver (E1) reviews and approves/rejects them
- **Role-based access** — three tiers (E1 approver, E2/E3 employees), with a single-E1 rule and an optional backup approver for continuity
- **Asset register** — ISO/IEC 27001:2022 (Annex A 5.9) aligned inventory of information and associated assets, editable as a spreadsheet
- **Audit logging** — every approval, rejection, role change, and deletion is recorded with actor, timestamp, and details
- **Data retention controls** — selective, checkbox-based deletion of old employee/request records by financial year
- **Financial-year partitioned employee data** — supports year-over-year record keeping

## Tech stack

**Backend:** Node.js, Express, PostgreSQL, JWT auth, bcrypt
**Frontend:** React, TypeScript, Vite, MUI (Material UI)

## Project structure

isms-backend/     Express API + PostgreSQL
isms-helpdesk/     React frontend

## Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL

### 1. Database

createdb isms_master

### 2. Backend

cd isms-backend
npm install
cp .env.example .env
node src/init.js
npm run dev

### 3. Frontend

cd isms-helpdesk
npm install
cp .env.example .env
npm run dev

## Default seeded accounts (after running init.js)

E1 (approver): e1admin / e1pass123
E2: e2user / e2pass123
E3: e3user / e3pass123

Change these before any real use.

## Security notes

- Only one E1 account is permitted system-wide
- New E2/E3 registrations require E1 approval before login is allowed
- Passwords require 8+ characters, one uppercase letter, one number
- Login is rate-limited (8 attempts / 15 min)
- Sessions expire after 8 hours; expired tokens force logout automatically

## Known limitations

- No automated/scheduled backups — manual backup download available to E1 via Admin Settings
- Single-server deployment target; not yet configured for horizontal scaling
- Excel import/export scripts exist (isms-backend/scripts/) but require testing with real data before production use
