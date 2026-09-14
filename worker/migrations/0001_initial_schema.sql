-- D1 Migration: Initial aggregate telemetry schema
-- Daily aggregated metrics table
CREATE TABLE IF NOT EXISTS daily_metrics (
  cycle_date TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  dimension TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (cycle_date, metric_name, dimension)
);

-- Anonymous cohort milestones table
CREATE TABLE IF NOT EXISTS cohort_metrics (
  cohort_cycle_id TEXT NOT NULL,
  milestone TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (cohort_cycle_id, milestone)
);
