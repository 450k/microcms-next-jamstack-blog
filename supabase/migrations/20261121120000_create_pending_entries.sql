-- 承認待ちメンバーのエントリー申請（承認時に entries へ自動登録する）
create table if not exists public.pending_entries (
  id bigint generated always as identity primary key,
  line_user_id text not null references public.members (line_user_id) on delete cascade,
  event_id text not null,
  event_title text,
  name text not null,
  created_at timestamptz not null default now(),
  unique (line_user_id, event_id)
);

-- anon / authenticated からは一切アクセスさせない（サーバーの service role のみ）
alter table public.pending_entries enable row level security;
