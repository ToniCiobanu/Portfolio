# Toni Ciobanu: Portfolio

Static site (GitHub Pages). Every project ships with its raw data, the code that
produces every number on its page, and a limits section.

| Project | Page | Source |
|---|---|---|
| DIY car repair costs (SQL) | `repair-analysis.html` | [`projects/repair-costs`](projects/repair-costs) |
| Phone prices vs. inflation (Python, BLS CPI-U) | `cell-phone-pricing.html` | [`projects/phone-prices`](projects/phone-prices) |
| Shift schedule → Google Calendar (Apps Script) | `calendar-automation.html` | [`projects/calendar-sync`](projects/calendar-sync) |

## How the numbers stay honest

Pages don't contain hand-typed results. Each project's script writes a
`results.js` / `source.js` file and the page renders from it.

```bash
bash scripts/check.sh   # results match data, tests pass, no broken links
```

CI runs the same check on every push. Requirements: Python 3 and Node 22, no packages.

## Updating a project

1. Edit the CSV in `projects/<name>/data/`.
2. Run `python3 projects/<name>/analyze.py`.
3. Commit the data and the regenerated results together.
