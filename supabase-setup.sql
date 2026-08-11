-- Run this once in your Supabase project's SQL editor.

create table donations (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  amount numeric not null,       -- amount in Naira (not kobo)
  provider text not null,        -- 'paystack' or 'flutterwave'
  status text not null default 'success',
  created_at timestamptz default now()
);

-- Public read access so the site can show the live total.
-- No public write access — only your serverless functions (using the
-- service role key) can insert rows, so donors can't fake entries.
alter table donations enable row level security;

create policy "Allow public read"
  on donations for select
  using (true);
