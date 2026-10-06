import { PROFILE_FIELDS } from "@/config/constants";
import { isNullableString, isRecord } from "@/lib/guards";
import type { Profile } from "@/types/auth";

export function parseProfile(value: unknown): Profile | null {
  if (!isRecord(value)) return null;

  const id = value[PROFILE_FIELDS.id];
  const email = value[PROFILE_FIELDS.email];
  const isPro = value[PROFILE_FIELDS.isPro];
  const proExpiresAt = value[PROFILE_FIELDS.proExpiresAt];
  const stripeConnectId = value[PROFILE_FIELDS.stripeConnectId];

  if (typeof id !== "string" || typeof email !== "string") return null;
  if (typeof isPro !== "boolean") return null;
  if (!isNullableString(proExpiresAt) || !isNullableString(stripeConnectId)) {
    return null;
  }

  return {
    id,
    email,
    is_pro: isPro,
    pro_expires_at: proExpiresAt,
    stripe_connect_id: stripeConnectId,
  };
}
