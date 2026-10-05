-- Markt-Cockpit, Stufe 3: Feedback aus dem Markt (Spec 2026-10-05, Abschnitt 4)
-- Einfügen nur über submit_feedback mit dem Feedback-Schlüssel der Website: die Datenbank kennt nur dessen SHA-256
-- (private.settings). So schreibt nur der Server nach Prüfung und Limit – ohne den allmächtigen Secret Key.
-- Lesen, Bearbeitungsstand ändern und löschen: Editoren (RLS). Löschfristen: pg_cron.

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  rating smallint not null check (rating between 1 and 5),
  aspects text[] not null default '{}'
    check (aspects <@ array['wartezeit', 'personal', 'frische', 'sauberkeit', 'sortiment', 'kasse', 'preis', 'sonstiges']::text[]),
  comment text not null default '' check (char_length(comment) <= 500),
  contact text not null default '' check (char_length(contact) <= 120),
  lang text not null default 'de' check (lang in ('de', 'tr', 'ar', 'ru', 'en')),
  google_click boolean not null default false,
  status text not null default 'neu' check (status in ('neu', 'erledigt')),
  handled_at timestamptz,
  handled_by uuid references auth.users (id) on delete set null
);
create index feedback_created on public.feedback (created_at desc);
alter table public.feedback enable row level security;

create policy "Editoren lesen Feedback" on public.feedback for select to authenticated using (private.is_editor());
create policy "Editoren erledigen Feedback" on public.feedback for update to authenticated using (private.is_editor()) with check (private.is_editor());
create policy "Editoren löschen Feedback" on public.feedback for delete to authenticated using (private.is_editor());
-- Bewertung und Text sind unveränderlich: Editoren ändern nur den Bearbeitungsstand; eingefügt wird nur über submit_feedback.
revoke insert, update on public.feedback from anon, authenticated;
grant update (status, handled_at, handled_by) on public.feedback to authenticated;

create table if not exists private.settings (key text primary key, value text not null);
revoke all on private.settings from public, anon, authenticated;

create or replace function private.feedback_key_ok(p_key text) returns boolean
language sql stable security definer set search_path = '' as $$
  select p_key is not null and exists (
    select 1 from private.settings s
    where s.key = 'feedback_key_sha256' and s.value = encode(extensions.digest(p_key, 'sha256'), 'hex')
  );
$$;
revoke all on function private.feedback_key_ok(text) from public;

create or replace function public.submit_feedback(
  p_key text, p_rating integer, p_aspects text[], p_comment text, p_contact text, p_lang text
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
begin
  if not private.feedback_key_ok(p_key) then
    raise exception 'Feedback-Schlüssel ungültig' using errcode = '42501';
  end if;
  insert into public.feedback (rating, aspects, comment, contact, lang)
  values (
    p_rating,
    coalesce(p_aspects, '{}'),
    coalesce(p_comment, ''),
    case when p_rating <= 3 then coalesce(p_contact, '') else '' end,
    coalesce(p_lang, 'de')
  )
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.submit_feedback(text, integer, text[], text, text, text) from public;
grant execute on function public.submit_feedback(text, integer, text[], text, text, text) to anon, authenticated;

create or replace function public.feedback_google_click(p_key text, p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.feedback_key_ok(p_key) then
    raise exception 'Feedback-Schlüssel ungültig' using errcode = '42501';
  end if;
  -- nur frische Einträge: ein alter Link ändert nichts mehr
  update public.feedback set google_click = true where id = p_id and created_at > now() - interval '2 hours';
end;
$$;
revoke all on function public.feedback_google_click(text, uuid) from public;
grant execute on function public.feedback_google_click(text, uuid) to anon, authenticated;

-- Löschfristen (Spec Abschnitt 4): Kontakt nach 90 Tagen, alles andere nach 12 Monaten – täglich 03:17 UTC
create extension if not exists pg_cron;
create or replace function private.feedback_retention() returns void
language sql security definer set search_path = '' as $$
  update public.feedback set contact = '' where contact <> '' and created_at < now() - interval '90 days';
  delete from public.feedback where created_at < now() - interval '12 months';
$$;
revoke all on function private.feedback_retention() from public;
select cron.schedule('feedback-loeschfristen', '17 3 * * *', 'select private.feedback_retention()');
