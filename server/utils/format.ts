export function fmtCurrency(amount: number | null | string): string {
  if (amount === null || amount === undefined || amount === "") return "Varies";
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(n)) return "Varies";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtDate(d: Date | string | null): string {
  if (!d) return "Rolling deadline";
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function daysUntil(d: Date | string | null): number | null {
  if (!d) return null;
  const date = d instanceof Date ? d : new Date(d);
  const now = new Date();
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
