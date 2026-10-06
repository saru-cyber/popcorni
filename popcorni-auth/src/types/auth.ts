/**
 * Row shape of public.profiles.
 * `id` is the Supabase Auth user id.
 */
export type Profile = {
  id: string;
  email: string;
  display_name: string;
  is_pro: boolean;
  pro_expires_at: string | null;
  stripe_connect_id: string | null;
};

/** Client-side insert. Billing columns stay at safe defaults. */
export type ProfileInsert = {
  id: string;
  email: string;
  display_name: string;
  is_pro: false;
  pro_expires_at: null;
  stripe_connect_id: null;
};

/** Signed-in Popcorni account, independent of the raw Supabase user object. */
export type PopcorniUser = {
  id: string;
  email: string;
  /** Name suggested by the auth provider, before a profile display name is saved. */
  metadataName: string;
};
