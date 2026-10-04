/** Notvorrat: BBK-Richtwerte (1 Person, 10 Tage) auf Haushalt und Tage hochrechnen. */
export const scaleAmount = (base: number, persons: number, days: number) => (base * persons * days) / 10;

const nf1 = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });

export function formatAmount(value: number, unit: "kg" | "l") {
  if (unit === "kg" && value < 1) return `${Math.round((value * 1000) / 10) * 10} g`;
  if (value >= 10) return `${Math.round(value)} ${unit}`;
  return `${nf1.format(Math.round(value * 10) / 10)} ${unit}`;
}

/** Anzahl 1,5-Liter-Flaschen (aufgerundet). */
export const bottles = (liters: number) => Math.ceil(liters / 1.5);
