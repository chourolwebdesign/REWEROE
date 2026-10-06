-- Markt-Cockpit, Stufe 1/2: Editoren und Wochenprospekte (Spec 2026-10-05, Abschnitte 1 und 3)

create table public.editors (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now()
);
alter table public.editors enable row level security;

-- In Richtlinien genutzt; security definer, damit die Prüfung nicht selbst an RLS scheitert.
create or replace function public.is_editor() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.editors e where e.user_id = (select auth.uid()));
$$;
revoke all on function public.is_editor() from public;
grant execute on function public.is_editor() to anon, authenticated;

create policy "Editoren sehen Editoren" on public.editors
  for select to authenticated using (public.is_editor());

create table public.flyers (
  id uuid primary key default gen_random_uuid(),
  week_start date not null check (extract(isodow from week_start) = 1),
  kw smallint not null check (kw between 1 and 53),
  year smallint not null check (year between 2024 and 2100),
  valid_from date not null,
  valid_to date not null check (valid_to >= valid_from),
  page_count smallint not null default 0 check (page_count between 0 and 80),
  page_width smallint not null default 0 check (page_width between 0 and 4000),
  page_height smallint not null default 0 check (page_height between 0 and 6000),
  format text not null default 'webp' check (format in ('webp', 'jpg')),
  source_name text not null default '' check (char_length(source_name) <= 200),
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
-- Höchstens ein veröffentlichter Prospekt je Woche; Entwürfe (Ersatz während des Hochladens) daneben erlaubt.
create unique index flyers_one_published_per_week on public.flyers (week_start) where status = 'published';
create index flyers_week on public.flyers (week_start);
alter table public.flyers enable row level security;

create policy "Veröffentlichte Prospekte sind öffentlich" on public.flyers
  for select to anon, authenticated using (status = 'published' or public.is_editor());
create policy "Editoren legen Prospekte an" on public.flyers
  for insert to authenticated with check (public.is_editor());
create policy "Editoren ändern Prospekte" on public.flyers
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "Editoren löschen Prospekte" on public.flyers
  for delete to authenticated using (public.is_editor());

-- Seitenbilder: öffentlich lesbar über die öffentliche URL, schreiben nur Editoren. 5 MB je Bild reichen (1800 px).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('prospekte', 'prospekte', true, 5242880, array['image/webp', 'image/jpeg']);

create policy "Editoren sehen Prospektbilder" on storage.objects
  for select to authenticated using (bucket_id = 'prospekte' and public.is_editor());
create policy "Editoren laden Prospektbilder hoch" on storage.objects
  for insert to authenticated with check (bucket_id = 'prospekte' and public.is_editor());
create policy "Editoren ersetzen Prospektbilder" on storage.objects
  for update to authenticated using (bucket_id = 'prospekte' and public.is_editor());
create policy "Editoren löschen Prospektbilder" on storage.objects
  for delete to authenticated using (bucket_id = 'prospekte' and public.is_editor());
