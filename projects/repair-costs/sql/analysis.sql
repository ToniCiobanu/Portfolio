-- Automotive repair cost analysis: queries
-- Each block starting with "-- name:" is executed by analyze.py and its result
-- set is written to results.js, which the web page renders. Nothing on the page
-- is typed in by hand.

-- name: overall
-- One-row summary across both vehicles.
SELECT
    COUNT(*)                                                   AS repairs,
    ROUND(SUM(diy_parts_cost), 2)                              AS diy_cost,
    ROUND(SUM(mechanic_estimate), 2)                           AS mechanic_estimate,
    ROUND(SUM(savings), 2)                                     AS savings,
    ROUND(SUM(savings) * 100.0 / SUM(mechanic_estimate), 2)    AS savings_pct,
    ROUND(AVG(savings), 2)                                     AS avg_savings_per_repair,
    ROUND(AVG(savings_pct), 2)                                 AS mean_of_repair_pcts
FROM repair_savings;

-- name: by_vehicle
SELECT
    vehicle,
    MAX(odometer_km)                                           AS odometer_km,
    COUNT(*)                                                   AS repairs,
    ROUND(SUM(diy_parts_cost), 2)                              AS diy_cost,
    ROUND(SUM(mechanic_estimate), 2)                           AS mechanic_estimate,
    ROUND(SUM(savings), 2)                                     AS savings,
    ROUND(SUM(savings) * 100.0 / SUM(mechanic_estimate), 2)    AS savings_pct
FROM repair_savings
JOIN vehicles USING (vehicle_id)
GROUP BY vehicle_id, vehicle
ORDER BY vehicle_id;

-- name: by_system
-- Dollar-weighted savings rate per system (SUM/SUM, not the mean of row percentages).
SELECT
    system,
    COUNT(*)                                                   AS repairs,
    ROUND(SUM(diy_parts_cost), 2)                              AS diy_cost,
    ROUND(SUM(mechanic_estimate), 2)                           AS mechanic_estimate,
    ROUND(SUM(savings), 2)                                     AS savings,
    ROUND(SUM(savings) * 100.0 / SUM(mechanic_estimate), 2)    AS savings_pct
FROM repair_savings
GROUP BY system
ORDER BY savings DESC;

-- name: by_reason
SELECT
    reason,
    COUNT(*)                                                   AS repairs,
    ROUND(SUM(savings), 2)                                     AS savings,
    ROUND(SUM(savings) * 100.0 / SUM(mechanic_estimate), 2)    AS savings_pct
FROM repair_savings
GROUP BY reason
ORDER BY savings DESC;

-- name: by_source
-- Return on parts spend: dollars saved per dollar spent on parts.
SELECT
    parts_source,
    COUNT(*)                                                   AS repairs,
    ROUND(SUM(diy_parts_cost), 2)                              AS diy_cost,
    ROUND(SUM(savings), 2)                                     AS savings,
    ROUND(SUM(savings) / SUM(diy_parts_cost), 2)               AS savings_per_parts_dollar
FROM repair_savings
GROUP BY parts_source
ORDER BY savings DESC;

-- name: ranked
-- Every repair ranked two ways. Percent rewards cheap parts; dollars rewards big jobs.
SELECT
    item_id,
    vehicle,
    description,
    system,
    reason,
    parts_source,
    diy_parts_cost,
    mechanic_estimate,
    ROUND(savings, 2)                                          AS savings,
    ROUND(savings_pct, 2)                                      AS savings_pct,
    RANK() OVER (ORDER BY savings_pct DESC)                    AS rank_by_pct,
    RANK() OVER (ORDER BY savings DESC)                        AS rank_by_dollars
FROM repair_savings
ORDER BY rank_by_pct;

-- name: concentration
-- How concentrated are the savings? Running share of total savings, biggest repairs first.
WITH ordered AS (
    SELECT
        description,
        vehicle,
        savings,
        ROW_NUMBER() OVER (ORDER BY savings DESC)              AS n,
        SUM(savings) OVER (ORDER BY savings DESC
                           ROWS UNBOUNDED PRECEDING)           AS running_savings,
        SUM(savings) OVER ()                                   AS total_savings
    FROM repair_savings
)
SELECT
    n,
    description,
    vehicle,
    ROUND(savings, 2)                                          AS savings,
    ROUND(running_savings * 100.0 / total_savings, 1)          AS cumulative_share_pct
FROM ordered
ORDER BY n;

-- name: sensitivity
-- The mechanic figures are estimates, the weakest input. If every estimate were
-- overstated by X%, what would the savings rate be?
WITH haircut(pct_overstated) AS (
    VALUES (0), (10), (25), (50)
),
totals AS (
    SELECT SUM(diy_parts_cost) AS diy, SUM(mechanic_estimate) AS mech
    FROM repair_savings
)
SELECT
    pct_overstated,
    ROUND(mech / (1 + pct_overstated / 100.0), 2)              AS adjusted_mechanic_total,
    ROUND(mech / (1 + pct_overstated / 100.0) - diy, 2)        AS savings,
    ROUND((mech / (1 + pct_overstated / 100.0) - diy) * 100.0
          / (mech / (1 + pct_overstated / 100.0)), 2)          AS savings_pct
FROM haircut, totals
ORDER BY pct_overstated;

-- name: break_even_hours
-- Labour time is not in the data, so instead of guessing it, ask: how many hours
-- could each job take before DIY pays less than a given hourly wage?
WITH wage(rate) AS (VALUES (25.0))
SELECT
    description,
    vehicle,
    ROUND(savings, 2)                                          AS savings,
    rate                                                       AS hourly_wage,
    ROUND(savings / rate, 1)                                   AS break_even_hours
FROM repair_savings, wage
ORDER BY break_even_hours;
