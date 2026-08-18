-- Prevent the same LINE user from creating multiple active entries for the same event.
create unique index if not exists entries_event_line_user_unique
on public.entries (event_id, line_user_id)
where cancelled = false and line_user_id is not null;
