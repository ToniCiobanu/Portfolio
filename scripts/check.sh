#!/usr/bin/env bash
# Verifies every project: generated results match the data, and tests pass.
# Run from the repo root: bash scripts/check.sh
set -euo pipefail
cd "$(dirname "$0")/.."

python3 projects/repair-costs/analyze.py --check
python3 projects/phone-prices/analyze.py --check
python3 projects/calendar-sync/embed.py --check
node --test projects/calendar-sync/test/*.test.js
python3 scripts/check_links.py
