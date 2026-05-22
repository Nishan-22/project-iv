# IT Club Voting System

Secure online voting for university club elections, with MetaMask wallet linking for student identity and votes stored in a trusted database backend.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React (JavaScript) + Vite + Tailwind CSS |
| Backend | Django + Django REST Framework + JWT |
| Database | SQLite (default; swap to PostgreSQL for production) |
| Wallet | MetaMask (connect + link address to student profile) |

## Project structure

```
club-voting-system/
├── backend/          # Django API
│   ├── config/       # settings, urls
│   └── voting/       # models, views, admin
├── frontend/         # React UI
└── README.md
```

## Prerequisites

On Ubuntu/Debian, install Python tooling first:

```bash
sudo apt update
sudo apt install python3-pip python3-venv
```

Also need **Node.js** and the **MetaMask** browser extension for wallet features.

## Quick start (both servers)

```bash
cd /home/nishan/Desktop/club-voting-system
./scripts/setup-backend.sh   # first time only
./scripts/dev.sh             # backend :8000 + frontend :5173
```

## Backend setup (manual)

```bash
cd /home/nishan/Desktop/club-voting-system/backend

# If `python3 -m venv .venv` fails (no ensurepip), use:
python3 -m venv .venv --without-pip
curl -sS https://bootstrap.pypa.io/get-pip.py -o get-pip.py
.venv/bin/python3 get-pip.py && rm get-pip.py

source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

Django admin: `python manage.py createsuperuser` or use seeded admin — `http://127.0.0.1:8000/admin/`

API base: `http://127.0.0.1:8000/api/`

## Frontend setup

```bash
cd /home/nishan/Desktop/club-voting-system/frontend

cp .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173`


## Core API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register/` | Student signup |
| POST | `/api/auth/login/` | JWT login |
| GET | `/api/auth/me/` | Current user |
| POST | `/api/auth/wallet/` | Link MetaMask address |
| GET | `/api/elections/` | List elections |
| GET | `/api/candidates/?election=1` | Approved candidates |
| POST | `/api/votes/` | Cast vote |
| GET | `/api/results/<election_id>/` | Tallies |

## Security

- **One vote per position**: DB constraint `UNIQUE(voter, election, position)`
- **JWT auth** on all voting routes
- **Election window**: `status=active` and `start_time <= now <= end_time`
- **Admin** manages elections and candidates via Django admin

## Roadmap

| Current | Planned |
|---------|---------|
| Votes in SQLite/PostgreSQL | On-chain vote recording |
| MetaMask wallet linking | Signed blockchain transactions |
| Django application layer | Smart contract trust layer |

## Open in Cursor

**File → Open Folder** → `/home/nishan/Desktop/club-voting-system`
