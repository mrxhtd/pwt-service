-- ─────────────────────────────────────────────────────────────────────────────
-- AquaTrack CRM — Advanced Features Migration
-- Run in Supabase SQL Editor after the initial schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- ── Predictive Stock Columns (per-client aggregate) ─────────────────────────
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS avg_daily_consumption NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_lead_time INT NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS current_stock NUMERIC NOT NULL DEFAULT 0;

-- ── PostGIS Location Column ─────────────────────────────────────────────────
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS location GEOMETRY(Point, 4326);

CREATE INDEX IF NOT EXISTS idx_clients_location ON clients USING GIST (location);

-- ── Predictive Stock Forecast View ──────────────────────────────────────────
CREATE OR REPLACE VIEW client_stock_forecast AS
SELECT
  id,
  name,
  current_stock,
  avg_daily_consumption,
  delivery_lead_time,
  CASE
    WHEN avg_daily_consumption > 0
      THEN ROUND((current_stock / avg_daily_consumption)::numeric, 1)
    ELSE NULL
  END AS days_remaining,
  CASE
    WHEN avg_daily_consumption > 0
      AND (current_stock / avg_daily_consumption) <= delivery_lead_time
      THEN TRUE
    ELSE FALSE
  END AS needs_reorder
FROM clients;
