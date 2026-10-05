/** Ziel nach der Anmeldung: nur Pfade im Cockpit, ohne „..“ und ohne fremde Hosts (kein offener Redirect). */
export function safeNext(value: unknown): string {
  if (typeof value !== "string") return "/cockpit";
  if (!/^\/cockpit(\/[A-Za-z0-9\-/]*)?(\?[A-Za-z0-9\-=&%.]*)?$/.test(value) || value.includes("..")) return "/cockpit";
  return value;
}
