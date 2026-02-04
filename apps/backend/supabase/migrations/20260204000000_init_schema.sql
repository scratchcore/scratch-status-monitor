-- Status Cache Table
create table if not exists status_cache (
  key text primary key,
  data jsonb not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

comment on table status_cache is 'Monitor status cache for fast retrieval';
comment on column status_cache.key is 'Unique cache key (e.g., "monitor:status:latest")';
comment on column status_cache.data is 'Serialized status response data';
comment on column status_cache.expires_at is 'Cache expiration timestamp';

create index if not exists idx_status_cache_expires on status_cache (expires_at);

-- History Records Table
create table if not exists history_records (
  id uuid primary key,
  monitor_id uuid not null,
  status text not null check (status in ('up', 'degraded', 'down', 'unknown')),
  status_code integer,
  response_time integer not null,
  error_message text,
  recorded_at timestamptz not null,
  bucketed_at timestamptz not null,
  created_at timestamptz not null default now()
);

comment on table history_records is 'Historical monitor status records';
comment on column history_records.monitor_id is 'Reference to the monitor being checked';
comment on column history_records.status is 'Status at time of check (up/degraded/down/unknown)';
comment on column history_records.status_code is 'HTTP status code if applicable';
comment on column history_records.response_time is 'Response time in milliseconds';
comment on column history_records.error_message is 'Error message if status check failed';
comment on column history_records.recorded_at is 'Exact time of the check';
comment on column history_records.bucketed_at is 'Time bucketed to interval (for aggregation)';

create index if not exists idx_history_monitor_recorded on history_records (monitor_id, recorded_at desc);
create index if not exists idx_history_bucketed on history_records (bucketed_at);
create index if not exists idx_history_recorded on history_records (recorded_at desc);

-- Enable RLS for security
alter table status_cache enable row level security;
alter table history_records enable row level security;

-- Service Role Policy: Allow full access for backend service
-- Service Role always bypasses RLS, so these policies are mainly for security compliance
create policy "service_role_full_access" on status_cache
  using (true)
  with check (true);

create policy "service_role_full_access" on history_records
  using (true)
  with check (true);

-- Cleanup: Remove expired cache entries periodically
-- Note: This can be done via a scheduled cleanup service or cron trigger
