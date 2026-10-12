BEGIN;
CREATE TABLE IF NOT EXISTS vra_clients (
  id uuid PRIMARY KEY, platform text NOT NULL, address text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(platform,address)
);
CREATE TABLE IF NOT EXISTS vra_conversations (
  seq bigserial UNIQUE, id uuid PRIMARY KEY, client_id uuid NOT NULL REFERENCES vra_clients(id),
  started_at timestamptz NOT NULL DEFAULT now(), last_activity_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz, close_reason text CHECK(close_reason IN ('rating','inactivity')),
  session jsonb NOT NULL, last_step text NOT NULL, rating jsonb,
  previous_id uuid REFERENCES vra_conversations(id), late_rating_for uuid REFERENCES vra_conversations(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS vra_one_open ON vra_conversations(client_id) WHERE closed_at IS NULL;
CREATE INDEX IF NOT EXISTS vra_inactive ON vra_conversations(last_activity_at) WHERE closed_at IS NULL;
CREATE TABLE IF NOT EXISTS vra_inbox (
  seq bigserial PRIMARY KEY, platform text NOT NULL, event_id text NOT NULL,
  client_id uuid NOT NULL REFERENCES vra_clients(id), body text NOT NULL, kind text NOT NULL,
  source_at timestamptz, received_at timestamptz NOT NULL DEFAULT now(), processed_at timestamptz,
  conversation_id uuid REFERENCES vra_conversations(id), UNIQUE(platform,event_id)
);
CREATE INDEX IF NOT EXISTS vra_inbox_pending ON vra_inbox(client_id,seq) WHERE processed_at IS NULL;
ALTER TABLE vra_inbox ADD COLUMN IF NOT EXISTS session_after jsonb;
CREATE TABLE IF NOT EXISTS vra_messages (
  seq bigserial PRIMARY KEY, conversation_id uuid NOT NULL REFERENCES vra_conversations(id),
  inbox_seq bigint REFERENCES vra_inbox(seq), sender text NOT NULL, body text NOT NULL,
  at timestamptz NOT NULL DEFAULT now(), source_at timestamptz, step text NOT NULL,
  delivery text NOT NULL DEFAULT 'received', provider_id text
);
CREATE TABLE IF NOT EXISTS vra_jobs (
  id uuid PRIMARY KEY, kind text NOT NULL CHECK(kind IN ('reply','summary')),
  conversation_id uuid NOT NULL REFERENCES vra_conversations(id), message_seq bigint REFERENCES vra_messages(seq),
  payload jsonb NOT NULL, state text NOT NULL DEFAULT 'pending'
    CHECK(state IN ('pending','sending','sent','needs_review')),
  attempts integer NOT NULL DEFAULT 0, due_at timestamptz NOT NULL DEFAULT now(),
  first_attempt_at timestamptz, uncertain_since timestamptz, lease_until timestamptz,
  lock_token uuid, accepted_at timestamptz, provider_id text, last_error text
);
CREATE UNIQUE INDEX IF NOT EXISTS vra_one_summary ON vra_jobs(conversation_id) WHERE kind='summary';
CREATE UNIQUE INDEX IF NOT EXISTS vra_one_reply ON vra_jobs(message_seq) WHERE kind='reply';
CREATE INDEX IF NOT EXISTS vra_due_jobs ON vra_jobs(due_at) WHERE state='pending';
CREATE TABLE IF NOT EXISTS vra_delivery_attempts (
  id bigserial PRIMARY KEY, job_id uuid NOT NULL REFERENCES vra_jobs(id), attempt integer NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz,
  outcome text, error text, provider_id text, UNIQUE(job_id,attempt)
);
CREATE TABLE IF NOT EXISTS vra_passport_claims (
  client_id uuid NOT NULL REFERENCES vra_clients(id), passport text NOT NULL, name_key text NOT NULL,
  conversation_id uuid NOT NULL REFERENCES vra_conversations(id), PRIMARY KEY(client_id,passport,name_key)
);
CREATE INDEX IF NOT EXISTS vra_passport_lookup ON vra_passport_claims(passport);
CREATE TABLE IF NOT EXISTS vra_client_links (
  client_a uuid NOT NULL REFERENCES vra_clients(id), client_b uuid NOT NULL REFERENCES vra_clients(id),
  passport text NOT NULL, status text NOT NULL CHECK(status IN ('matched','ambiguous')),
  reason text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(client_a,client_b,passport)
);
CREATE TABLE IF NOT EXISTS vra_job_runs (
  id uuid PRIMARY KEY, started_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz, error text
);
COMMIT;
