import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  AUTH,
  DISPLAY_NAME_MAX_LENGTH,
  PROFILE_COLUMNS,
  PROFILE_COLUMNS_WITHOUT_DISPLAY_NAME,
  PROFILE_DEFAULTS,
  PROFILE_FIELDS,
} from "@/config/constants";
import { parseProfile } from "@/lib/auth/parseProfile";
import type { PopcorniUser, Profile, ProfileInsert } from "@/types/auth";

const METADATA_NAME_KEYS = ["display_name", "full_name", "name"] as const;

export function metadataDisplayName(user: User): string {
  const meta = user.user_metadata;
  if (!meta || typeof meta !== "object") return "";
  const record = meta as Record<string, unknown>;
  for (const key of METADATA_NAME_KEYS) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return normalizeDisplayName(value);
  }
  return "";
}

export function toPopcorniUser(user: User): PopcorniUser {
  return {
    id: user.id,
    email: user.email ?? "",
    metadataName: metadataDisplayName(user),
  };
}

export function displayEmail(
  user: PopcorniUser | null,
  profile: Profile | null,
): string {
  return profile?.email || user?.email || "";
}

export function normalizeDisplayName(value: string): string {
  return value.replace(/[\u0000-\u001F]/g, " ").replace(/\s+/g, " ").trim().slice(0, DISPLAY_NAME_MAX_LENGTH);
}

/** Saved profile name, then the provider name, then the mailbox name. */
export function resolveDisplayName(
  user: PopcorniUser | null,
  profile: Profile | null,
): string {
  const saved = normalizeDisplayName(profile?.display_name ?? "");
  if (saved) return saved;
  const suggested = normalizeDisplayName(user?.metadataName ?? "");
  if (suggested) return suggested;
  const email = displayEmail(user, profile);
  const local = email.split("@")[0] ?? "";
  return normalizeDisplayName(local);
}

function missingDisplayNameColumn(message: string): boolean {
  return /display_name/i.test(message) && /does not exist|schema cache|column/i.test(message);
}

async function selectOwnProfile(
  supabase: SupabaseClient,
  userId: string,
) {
  const primary = await supabase
    .from(AUTH.profileTable)
    .select(PROFILE_COLUMNS)
    .eq(PROFILE_FIELDS.id, userId)
    .maybeSingle();
  if (!primary.error || !missingDisplayNameColumn(primary.error.message)) {
    return primary;
  }
  return supabase
    .from(AUTH.profileTable)
    .select(PROFILE_COLUMNS_WITHOUT_DISPLAY_NAME)
    .eq(PROFILE_FIELDS.id, userId)
    .maybeSingle();
}

export async function loadOrCreateProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<Profile | null> {
  const existing = await selectOwnProfile(supabase, user.id);
  if (existing.error) return null;

  const parsed = parseProfile(existing.data);
  if (parsed) return parsed;
  if (existing.data) return null;

  const insertPayload: ProfileInsert = {
    id: user.id,
    email: user.email ?? "",
    display_name: metadataDisplayName(user) || PROFILE_DEFAULTS.displayName,
    is_pro: PROFILE_DEFAULTS.isPro,
    pro_expires_at: PROFILE_DEFAULTS.proExpiresAt,
    stripe_connect_id: PROFILE_DEFAULTS.stripeConnectId,
  };

  const created = await supabase
    .from(AUTH.profileTable)
    .insert(insertPayload)
    .select(PROFILE_COLUMNS)
    .single();

  if (!created.error) return parseProfile(created.data);
  if (!missingDisplayNameColumn(created.error.message)) return null;

  const { display_name: _ignored, ...legacyPayload } = insertPayload;
  const legacy = await supabase
    .from(AUTH.profileTable)
    .insert(legacyPayload)
    .select(PROFILE_COLUMNS_WITHOUT_DISPLAY_NAME)
    .single();
  if (legacy.error) return null;
  return parseProfile(legacy.data);
}

export async function saveDisplayName(
  supabase: SupabaseClient,
  userId: string,
  name: string,
): Promise<Profile> {
  const displayName = normalizeDisplayName(name);
  const updated = await supabase
    .from(AUTH.profileTable)
    .update({ [PROFILE_FIELDS.displayName]: displayName })
    .eq(PROFILE_FIELDS.id, userId)
    .select(PROFILE_COLUMNS)
    .maybeSingle();

  if (updated.error) throw new Error(updated.error.message);
  const parsed = parseProfile(updated.data);
  if (!parsed) throw new Error("Profile is not ready yet.");
  return parsed;
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
