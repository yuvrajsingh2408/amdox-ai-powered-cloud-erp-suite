-- Amdox ERP — Initial Database Setup
-- Run automatically via Docker entrypoint

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For composite GIN indexes

-- Create application user (least privilege)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'amdox_app') THEN
    CREATE ROLE amdox_app WITH LOGIN PASSWORD 'CHANGE_IN_ENV';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE amdox_erp TO amdox_app;
GRANT USAGE ON SCHEMA public TO amdox_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO amdox_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO amdox_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO amdox_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO amdox_app;
