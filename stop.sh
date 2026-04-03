#!/bin/zsh

set -euo pipefail

echo "Stopping local HBnB servers on ports 8000 and 5000"

for port in 8000 5000; do
  pids="$(lsof -ti tcp:$port || true)"

  if [[ -n "$pids" ]]; then
    echo "$pids" | xargs kill
  fi
done

echo "Done."
