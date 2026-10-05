/**
 * Alle Zeilen einer Abfrage, Seite für Seite: PostgREST (Supabase) liefert je Abfrage höchstens „Max rows“ (1000) –
 * `.limit()` hebt das nicht auf. Ein Fehler bricht ab, statt still weniger zu liefern.
 */
export async function allPages<T>(
  fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  size = 1000,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += size) {
    const { data, error } = await fetchPage(from, from + size - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < size) return rows;
  }
}
