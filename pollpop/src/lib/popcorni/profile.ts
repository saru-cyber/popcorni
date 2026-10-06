import type { SupabaseClient, User } from "@supabase/supabase-js";
import { AUTH, PROFILE_COLUMNS, PROFILE_FIELDS } from "@/lib/popcorni/constants";

/** Row shape of public.profiles shared with popcorni-auth. */
export type Profile = {
  id: string;
  email: string;
  is_pro: boolean;
  pro_expires_at: string | null;
  stripe_connect_id: string | null;
};

export type PopcorniUser = {
  id: string;
  email: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

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

export function toPopcorniUser(user: User): PopcorniUser {
  return {
    id: user.id,
    email: user.email ?? "",
  };
}

export async function loadProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<Profile | null> {
  const existing = await supabase
    .from(AUTH.profileTable)
    .select(PROFILE_COLUMNS)
    .eq(PROFILE_FIELDS.id, userId)
    .maybeSingle();
  if (existing.error) return null;
  return parseProfile(existing.data);
}

export function subscribeToProfile(
  supabase: SupabaseClient,
  userId: string,
  onProfile: (profile: Profile) => void,
): () => void {
  const channel = supabase
    .channel(`${AUTH.profileChannelPrefix}${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: AUTH.profileSchema,
        table: AUTH.profileTable,
        filter: `${PROFILE_FIELDS.id}=eq.${userId}`,
      },
      (payload) => {
        const parsed = parseProfile(payload.new);
        if (parsed) onProfile(parsed);
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
