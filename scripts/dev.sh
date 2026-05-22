#!/usr/bin/env bash
set -euo pipefail
ROOT="$(dirname "$0")/.."

cd "$ROOT/backend"
.venv/bin/python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

cd "$ROOT/frontend"
npm run dev -- --host 127.0.0.1 &
FRONTEND_PID=$!

trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null' EXIT
echo "Backend:  http://127.0.0.1:8000"
echo "Frontend: http://127.0.0.1:5173"
wait
