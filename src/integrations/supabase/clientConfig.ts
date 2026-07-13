// Supabase client configuration, kept separate from client.ts so the client
// can be regenerated/replaced without losing this logic.
//
// This is the mechanism that lets the Web App / Mobile App 1 / Mobile App 2
// portals run from one codebase against one Supabase project WITHOUT their auth
// sessions colliding in the same browser: each portal gets its own auth
// storageKey, chosen once at module init from the current pathname. Because the
// key is chosen at init, switching portals must be a FULL page reload (see
// Hub.tsx) so the client re-evaluates with the correct key.
import {
  ALL_STORAGE_KEYS,
  DEFAULT_STORAGE_KEY,
  portalFromPathname,
} from "@/config/portals";

/**
 * The auth storage key for the current portal. Chosen once at module init.
 */
export const getSupabaseStorageKey = (): string => {
  if (typeof window === "undefined") return DEFAULT_STORAGE_KEY;
  const portal = portalFromPathname(window.location.pathname);
  return portal?.storageKey ?? DEFAULT_STORAGE_KEY;
};

/**
 * One-time cleanup hook for legacy/rotated storage keys. Safe on every load.
 * Add removeItem() calls here when you rename a storage key.
 */
export const purgeLegacySupabaseKey = (): void => {
  if (typeof window === "undefined") return;
  try {
    // localStorage.removeItem("sb-old-key-auth-token");
  } catch {
    /* ignore */
  }
};

export { ALL_STORAGE_KEYS };
