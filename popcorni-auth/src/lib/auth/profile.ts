import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  AUTH,
  PROFILE_COLUMNS,
  PROFILE_DEFAULTS,
  PROFILE_FIELDS,
} from "@/config/constants";
import { parseProfile } from "@/lib/auth/parseProfile";
import type { PopcorniUser, Profile, ProfileInsert } from "@/types/auth";

export function toPopcorniUser(user: User): PopcorniUser {
  return {
    id: user.id,
    email: user.email ?? "",
  };
}

export function displayEmail(
  user: PopcorniUser | null,
  profile: Profile | null,
): string {
  return profile?.email || user?.email || "";
}

export async function loadOrCreateProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<Profile | null> {
  const existing = await supabase
    .from(AUTH.profileTable)
    .select(PROFILE_COLUMNS)
    .eq(PROFILE_FIELDS.id, user.id)
    .maybeSingle();

  if (existing.error) return null;

  const parsed = parseProfile(existing.data);
  if (parsed) return parsed;
  if (existing.data) return null;

  const insertPayload: ProfileInsert = {
    id: user.id,
    email: user.email ?? "",
    is_pro: PROFILE_DEFAULTS.isPro,
    pro_expires_at: PROFILE_DEFAULTS.proExpiresAt,
    stripe_connect_id: PROFILE_DEFAULTS.stripeConnectId,
  };

  const created = await supabase
    .from(AUTH.profileTable)
    .insert(insertPayload)
    .select(PROFILE_COLUMNS)
    .single();

  if (created.error) return null;
  return parseProfile(created.data);
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
