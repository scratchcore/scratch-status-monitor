-- Remove duplicate history records, keeping only the latest for each monitor_id, recorded_at pair
-- This migration uses a CTE with ROW_NUMBER() to safely identify and remove duplicates

with duplicates as (
  select id, row_number() over (
    partition by monitor_id, recorded_at 
    order by recorded_at desc
  ) as rn
  from history_records
)
delete from history_records 
where id in (
  select id from duplicates where rn > 1
);
