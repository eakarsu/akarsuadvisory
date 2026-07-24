BEGIN;
CREATE TABLE IF NOT EXISTS runtime_ai_results(
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES advisory_identities(id),
  prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  provider_receipt TEXT NOT NULL,
  result TEXT NOT NULL,
  usage JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS runtime_ai_results_user_created_idx ON runtime_ai_results(user_id,created_at DESC);
COMMIT;
