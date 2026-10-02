-- Automotive repair cost analysis: schema
-- Runs on SQLite 3.25+ and PostgreSQL. Loaded by analyze.py from data/*.csv.

CREATE TABLE vehicles (
    vehicle_id   INTEGER PRIMARY KEY,
    make         TEXT    NOT NULL,
    model        TEXT    NOT NULL,
    year         INTEGER NOT NULL,
    odometer_km  INTEGER,
    acquired     DATE
);

CREATE TABLE repairs (
    item_id            INTEGER PRIMARY KEY,
    vehicle_id         INTEGER NOT NULL REFERENCES vehicles (vehicle_id),
    description        TEXT    NOT NULL,
    system             TEXT    NOT NULL,  -- part of the car the repair touches
    reason             TEXT    NOT NULL,  -- wear | crash | safety_inspection | upgrade
    diy_parts_cost     NUMERIC NOT NULL CHECK (diy_parts_cost >= 0),  -- from receipts
    mechanic_estimate  NUMERIC NOT NULL CHECK (mechanic_estimate > 0), -- parts + labour quote/estimate
    parts_source       TEXT    NOT NULL
);

-- Savings are derived, never stored, so they can't drift out of sync with the inputs.
CREATE VIEW repair_savings AS
SELECT
    r.*,
    v.make || ' ' || v.model || ' ' || v.year           AS vehicle,
    r.mechanic_estimate - r.diy_parts_cost               AS savings,
    (r.mechanic_estimate - r.diy_parts_cost) * 100.0
        / r.mechanic_estimate                            AS savings_pct
FROM repairs r
JOIN vehicles v ON v.vehicle_id = r.vehicle_id;
