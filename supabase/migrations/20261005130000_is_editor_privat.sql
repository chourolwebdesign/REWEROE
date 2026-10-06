-- is_editor() aus dem öffentlichen API-Schema nehmen (Supabase-Advisor 0028/0029): Richtlinien rufen die Funktion weiter auf,
-- über /rest/v1/rpc ist sie nicht mehr erreichbar.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.is_editor() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.editors e where e.user_id = (select auth.uid()));
$$;
revoke all on function private.is_editor() from public;
grant execute on function private.is_editor() to anon, authenticated;

alter policy "Editoren sehen Editoren" on public.editors using (private.is_editor());
alter policy "Veröffentlichte Prospekte sind öffentlich" on public.flyers using (status = 'published' or private.is_editor());
alter policy "Editoren legen Prospekte an" on public.flyers with check (private.is_editor());
alter policy "Editoren ändern Prospekte" on public.flyers using (private.is_editor()) with check (private.is_editor());
alter policy "Editoren löschen Prospekte" on public.flyers using (private.is_editor());
alter policy "Editoren sehen Prospektbilder" on storage.objects using (bucket_id = 'prospekte' and private.is_editor());
alter policy "Editoren laden Prospektbilder hoch" on storage.objects with check (bucket_id = 'prospekte' and private.is_editor());
alter policy "Editoren ersetzen Prospektbilder" on storage.objects using (bucket_id = 'prospekte' and private.is_editor());
alter policy "Editoren löschen Prospektbilder" on storage.objects using (bucket_id = 'prospekte' and private.is_editor());

drop function public.is_editor();
