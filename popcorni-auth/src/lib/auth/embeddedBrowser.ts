import { EMBEDDED_BROWSER_UA_PATTERNS } from "@/config/constants";

export function isEmbeddedBrowser(userAgent: string): boolean {
  const haystack = userAgent.toLowerCase();
  return EMBEDDED_BROWSER_UA_PATTERNS.some((pattern) =>
    haystack.includes(pattern.toLowerCase()),
  );
}
