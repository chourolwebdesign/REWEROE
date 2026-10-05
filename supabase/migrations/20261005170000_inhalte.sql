-- Markt-Cockpit, Stufe 4a: Sondertage, Termine, Stellen (Spec 2026-10-05, Abschnitte 1 und 5)
-- Öffentlich lesbar (Stellen nur aktiv und nicht abgelaufen), schreiben nur Editoren.

create table public.special_days (
  date date primary key,
  label text not null check (char_length(label) between 1 and 60),
  closed boolean not null default false,
  opens time,
  closes time,
  updated_at timestamptz not null default now(),
  check (closed or (opens is not null and closes is not null and opens < closes))
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time text not null default '' check (char_length(time) <= 40),
  title text not null check (char_length(title) between 1 and 80),
  text text not null default '' check (char_length(text) <= 600),
  created_at timestamptz not null default now()
);
create index events_date on public.events (date);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 80),
  employment text not null check (employment in ('Vollzeit', 'Teilzeit', 'Minijob', 'Ausbildung')),
  text text not null check (char_length(text) between 1 and 1500),
  date_posted date not null default (now() at time zone 'Europe/Berlin')::date,
  valid_through date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.special_days enable row level security;
alter table public.events enable row level security;
alter table public.jobs enable row level security;

create policy "Sondertage sind öffentlich" on public.special_days for select to anon, authenticated using (true);
create policy "Termine sind öffentlich" on public.events for select to anon, authenticated using (true);
create policy "Aktive Stellen sind öffentlich" on public.jobs for select to anon, authenticated
  using ((active and (valid_through is null or valid_through >= (now() at time zone 'Europe/Berlin')::date)) or private.is_editor());

create policy "Editoren pflegen Sondertage" on public.special_days for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "Editoren pflegen Termine" on public.events for all to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "Editoren pflegen Stellen" on public.jobs for all to authenticated using (private.is_editor()) with check (private.is_editor());
