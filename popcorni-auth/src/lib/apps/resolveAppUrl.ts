import { APP_IDS, getPollpopUrl } from "@/config/constants";
import type { SuiteApp } from "@/types/apps";

/**
 * PollPop prefers `NEXT_PUBLIC_POLLPOP_URL`.
 * When that variable is empty, the link falls back to http://localhost:3000.
 */
export function resolveSuiteAppUrl(app: SuiteApp): string {
  if (app.id === APP_IDS.pollpop) {
    return getPollpopUrl();
  }
  return app.defaultUrl;
}
