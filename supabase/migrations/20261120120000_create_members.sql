-- エントリー可能なメンバー（LINEユーザー）を管理するテーブル
-- status: pending（承認待ち） / approved（承認済み） / rejected（却下）
create table if not exists public.members (
  line_user_id text primary key,
  display_name text,
  name text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- anon / authenticated からは一切アクセスさせない（サーバーの service role のみ）
alter table public.members enable row level security;

-- 既存のLINEエントリー者を承認済みとして移行（最新のエントリー名を採用）
insert into public.members (line_user_id, name, status)
select distinct on (line_user_id) line_user_id, name, 'approved'
from public.entries
where line_user_id is not null
order by line_user_id, created_at desc
on conflict (line_user_id) do nothing;
