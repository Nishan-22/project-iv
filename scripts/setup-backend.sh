#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../backend"

if [ ! -d .venv ]; then
  python3 -m venv .venv --without-pip
  .venv/bin/python3 - <<'PY'
import urllib.request
urllib.request.urlretrieve("https://bootstrap.pypa.io/get-pip.py", "get-pip.py")
PY
  .venv/bin/python3 get-pip.py
  rm -f get-pip.py
fi

.venv/bin/pip install -r requirements.txt
[ -f .env ] || cp .env.example .env
.venv/bin/python manage.py migrate
.venv/bin/python manage.py seed_demo
echo "Backend ready. Run: cd backend && .venv/bin/python manage.py runserver"
