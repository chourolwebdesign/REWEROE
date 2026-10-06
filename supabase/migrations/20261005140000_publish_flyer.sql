-- Prospekt in einer Transaktion veröffentlichen (Abschluss-Review I1). Bisher löschte die Server-Aktion den alten
-- Prospekt der Woche, bevor der neue freigeschaltet war – scheiterte das Freischalten, stand die Woche ohne Prospekt da.
-- security invoker: läuft mit den Rechten des Aufrufers, RLS gilt (nur Editoren sehen Entwürfe und dürfen ändern).
create or replace function public.publish_flyer(
  p_id uuid,
  p_page_count integer,
  p_page_width integer,
  p_page_height integer,
  p_format text
) returns uuid[]
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_week date;
  v_replaced uuid[];
begin
  select week_start into v_week from public.flyers where id = p_id and status = 'draft' for update;
  if not found then
    raise exception 'Entwurf % nicht gefunden', p_id using errcode = 'P0002';
  end if;
  -- ersetzte Prospekte zurückgeben: ihre Bilder löscht die Server-Aktion danach
  with removed as (
    delete from public.flyers where week_start = v_week and status = 'published' returning id
  )
  select coalesce(array_agg(id), '{}') into v_replaced from removed;
  -- Prüfungen der Tabelle (Seitenzahl, Maße, Format) greifen hier; ein Fehler macht auch das Löschen rückgängig
  update public.flyers
     set status = 'published', page_count = p_page_count, page_width = p_page_width, page_height = p_page_height, format = p_format
   where id = p_id;
  return v_replaced;
end;
$$;

revoke all on function public.publish_flyer(uuid, integer, integer, integer, text) from public, anon;
grant execute on function public.publish_flyer(uuid, integer, integer, integer, text) to authenticated;
