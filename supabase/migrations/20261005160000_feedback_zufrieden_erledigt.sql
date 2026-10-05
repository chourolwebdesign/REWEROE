-- Abschluss-Review Stufe 3 (I6): 4–5 Sterne tragen weder Kommentar noch Kontakt – nichts zu erledigen. Sie kommen gleich als
-- „erledigt“ an, damit „Neu“ im Cockpit nur zeigt, was die Marktleitung bearbeiten muss. Kennzahlen und CSV zählen sie weiter.
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
  insert into public.feedback (rating, aspects, comment, contact, lang, status, handled_at)
  values (
    p_rating,
    coalesce(p_aspects, '{}'),
    coalesce(p_comment, ''),
    case when p_rating <= 3 then coalesce(p_contact, '') else '' end,
    coalesce(p_lang, 'de'),
    case when p_rating >= 4 then 'erledigt' else 'neu' end,
    case when p_rating >= 4 then now() end
  )
  returning id into v_id;
  return v_id;
end;
$$;
