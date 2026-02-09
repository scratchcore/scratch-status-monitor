-- Enforce uniqueness for history records by monitor_id and recorded_at
create unique index if not exists idx_history_unique_monitor_recorded
  on history_records (monitor_id, recorded_at);
