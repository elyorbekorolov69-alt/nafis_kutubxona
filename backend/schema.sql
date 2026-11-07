-- Supabase: SQL Editor ga qo'yib, bir marta ishga tushiring.
create table if not exists public.taklifnomalar (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Jadvalga faqat backend (service_role kaliti) yoza oladi, ochiq so'rovlar yopiq:
alter table public.taklifnomalar enable row level security;
