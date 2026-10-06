import { getStripeProCheckoutUrl, STRIPE } from "@/config/constants";
import type { PopcorniUser } from "@/types/auth";

export function buildStripeCheckoutUrl(user: PopcorniUser | null): string | null {
  const base = getStripeProCheckoutUrl();
  if (!base) return null;

  let url: URL;
  try {
    url = new URL(base);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (user?.id) url.searchParams.set(STRIPE.clientReferenceParam, user.id);
  if (user?.email) url.searchParams.set(STRIPE.emailParam, user.email);
  return url.toString();
}
