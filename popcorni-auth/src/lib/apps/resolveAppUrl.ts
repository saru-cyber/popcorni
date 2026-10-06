import { APP_IDS, getPollpopUrlOverride } from "@/config/constants";
import type { SuiteApp } from "@/types/apps";

export function resolveSuiteAppUrl(app: SuiteApp): string {
  if (app.id === APP_IDS.pollpop) {
    return getPollpopUrlOverride() || app.defaultUrl;
  }
  return app.defaultUrl;
}
