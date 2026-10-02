# DIY car repair costs

**Question:** how much did doing my own repairs on two used cars save versus shop prices, and how much does that answer depend on the shop estimates?

- `data/repairs.csv`: one row per repair. Parts cost is from receipts (CAD); `mechanic_estimate` is a shop quote, posted price, or book labour × shop rate plus parts.
- `sql/schema.sql`: tables plus a `repair_savings` view (savings are derived, never stored).
- `sql/analysis.sql`: every query the page shows. Uses joins, GROUP BY, CTEs and window functions (`RANK`, running `SUM ... OVER`).
- `analyze.py`: loads the CSVs into SQLite, runs each `-- name:` block, asserts breakdowns sum to the total, and writes `results.json` / `results.js`.

```bash
python3 analyze.py
```

**Limits:** no labour hours or tool costs recorded; shop costs are estimates (see the sensitivity query); two rows (used hood, bumper) aren't equal-quality comparisons.
