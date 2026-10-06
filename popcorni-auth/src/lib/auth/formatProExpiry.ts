import { LOCALE, PRO_COPY } from "@/config/constants";

export function formatProExpiry(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(LOCALE, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function proExpiryLine(iso: string): string {
  const formatted = formatProExpiry(iso);
  if (!formatted) return "";
  return `${PRO_COPY.expiresPrefix} ${formatted}`;
}
