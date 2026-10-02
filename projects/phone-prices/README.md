# Phone prices vs. inflation

**Question:** are phones getting more expensive once you account for inflation?

- `data/phones.csv`: U.S. launch price of the base model. `price_full` (outright) and `price_contract` (two-year-contract headline price) are kept separately; every row has a `source` and `confidence`.
- `data/cpi_u_annual.csv`: BLS CPI-U, U.S. city average, all items, annual average, 1982–84 = 100.
- `analyze.py`: `real = nominal × CPI(2025) / CPI(launch year)`; headline numbers use `price_full` only.

```bash
python3 analyze.py
```

**Key data-quality point:** comparing a $199 contract price to a $649 full price creates a fake 226% "jump" in 2016. Like for like, the change is 0%.

**Limits:** CPI-U is general inflation, not a quality-adjusted phone index; base models only; list price, not transaction price; curated, not random, sample.
