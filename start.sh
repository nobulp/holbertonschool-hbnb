#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PART3_DIR="$ROOT_DIR/part3"
PART4_DIR="$ROOT_DIR/part4"
VENV_PYTHON="$PART3_DIR/venv/bin/python3"

if [[ ! -x "$VENV_PYTHON" ]]; then
  echo "Missing virtual environment in part3."
  echo "Run:"
  echo "  cd \"$PART3_DIR\""
  echo "  python3 -m venv venv"
  echo "  source venv/bin/activate"
  echo "  python3 -m pip install -r requirements.txt"
  exit 1
fi

echo "Starting API on http://127.0.0.1:5000"
osascript -e "tell application \"Terminal\" to do script \"cd '$PART3_DIR' && source venv/bin/activate && python3 run.py\""

echo "Starting front-end on http://localhost:8000"
osascript -e "tell application \"Terminal\" to do script \"cd '$PART4_DIR' && python3 -m http.server 8000\""

sleep 2

echo "Opening home page"
open "http://localhost:8000/index.html"

echo ""
echo "HBnB is launching:"
echo "  Front: http://localhost:8000/index.html"
echo "  API:   http://127.0.0.1:5000"
echo ""
echo "Two Terminal tabs were opened."
