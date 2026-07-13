import {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  ALL_STORAGE_KEYS,
  rolesCanAccessPortal,
  type PortalId,
} from "@/config/portals";

// Generic profile shape — mirror your `profiles` table here.
export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

// A user's membership in one organization, with their PER-ORG role.
export interface Membership {
  orgId: string;
  orgName: string;
  role: string;
}

interface SignUpOptions {
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
  /** The user's org memberships (org + per-org role). */
  memberships: Membership[];
  /** Distinct roles the user holds across ALL their organizations. */
  roles: string[];
  /** True once we have a user AND their profile/memberships have loaded. */
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  /** True if any membership grants a role allowed by this portal. */
  canAccessPortal: (portal: PortalId) => boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    options?: SignUpOptions,
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Monotonic id for fetchUserData runs. Concurrent calls (auth-listener
  // hydration + an explicit refreshProfile) can race; the older fetch must not
  // overwrite the newer one.
  const fetchSeqRef = useRef(0);
  // The user id whose roles/profile are currently loaded. Lets the auth
  // listener tell a genuine identity change (first load / sign-in / user
  // switch) apart from a same-user token refresh, so the latter never re-gates
  // `loading` (which would blank the app on tab refocus).
  const currentUserIdRef = useRef<string | null>(null);

  const fetchUserData = async (
    userId: string,
    { silent = false }: { silent?: boolean } = {},
  ) => {
    const mySeq = ++fetchSeqRef.current;
    if (!silent) setLoading(true);
    try {
      for (let attempt = 1; attempt <= 4; attempt += 1) {
        // profiles + organizations are two simple RLS-scoped queries. The
        // organizations query returns only orgs the user is a member of (RLS),
        // and memberships give the per-org role — merge them by org_id.
        const [profileResult, memberResult, orgResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, user_id, email, full_name, avatar_url")
            .eq("user_id", userId)
            .maybeSingle(),
          supabase
            .from("organization_members")
            .select("org_id, role")
            .eq("user_id", userId),
          supabase.from("organizations").select("id, name"),
        ]);

        const nextProfile = (profileResult.data as Profile | null) ?? null;

        // The profile row is created by a DB trigger on signup; retry briefly
        // if it isn't visible yet (memberships CAN legitimately be empty — a
        // brand-new user has no org until they create/join one).
        const shouldRetryForHydration =
          !profileResult.error && !nextProfile && attempt < 4;

        if (shouldRetryForHydration) {
          await wait(150 * attempt);
          continue;
        }

        if (profileResult.error) throw profileResult.error;
        if (memberResult.error) throw memberResult.error;
        if (orgResult.error) throw orgResult.error;

        // Drop result if a newer fetch has already started/completed.
        if (mySeq !== fetchSeqRef.current) return;

        const orgNames = new Map(
          (orgResult.data ?? []).map((o) => [o.id, o.name]),
        );
        const nextMemberships: Membership[] = (memberResult.data ?? []).map(
          (m) => ({
            orgId: m.org_id,
            role: m.role,
            orgName: orgNames.get(m.org_id) ?? "Organization",
          }),
        );

        setProfile(nextProfile);
        setMemberships(nextMemberships);
        return;
      }

      if (mySeq !== fetchSeqRef.current) return;
      setProfile(null);
      setMemberships([]);
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (mySeq !== fetchSeqRef.current) return;
      setProfile(null);
      setMemberships([]);
    } finally {
      if (mySeq === fetchSeqRef.current && !silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    // Full hydrate — ONLY for a genuine identity change (first load, sign-in,
    // or a switch to a different user). Debounced to collapse rapid parallel
    // events into one fetch. Shows the `loading` gate because there is no
    // existing user data to keep on screen.
    const hydrateIdentity = (nextSession: Session | null) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentUserIdRef.current = nextSession?.user?.id ?? null;
        setSession(nextSession);
        setUser(nextSession?.user ?? null);

        if (nextSession?.user) {
          setLoading(true);
          // Defer — onAuthStateChange must not await Supabase calls directly.
          setTimeout(() => {
            fetchUserData(nextSession.user.id);
          }, 0);
        } else {
          setMemberships([]);
          setProfile(null);
          setLoading(false);
        }
      }, 150);
    };

    // Silent session update — a token refresh (or a re-fired SIGNED_IN /
    // INITIAL_SESSION on tab refocus) for the SAME already-loaded user. Only
    // the access token changed; swap it in WITHOUT touching `loading`, so no
    // page/query remounts + refetches. This is the fix for "the app refreshes
    // every time I switch browser tabs".
    const refreshSessionSilently = (
      nextSession: Session | null,
      { refetchProfile = false }: { refetchProfile?: boolean } = {},
    ) => {
      currentUserIdRef.current = nextSession?.user?.id ?? null;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (refetchProfile && nextSession?.user) {
        fetchUserData(nextSession.user.id, { silent: true });
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      const sameUser =
        !!nextSession?.user && nextSession.user.id === currentUserIdRef.current;

      switch (event) {
        case "INITIAL_SESSION":
        case "SIGNED_IN":
          if (sameUser) refreshSessionSilently(nextSession);
          else hydrateIdentity(nextSession);
          break;
        case "TOKEN_REFRESHED":
          if (sameUser) refreshSessionSilently(nextSession);
          else hydrateIdentity(nextSession);
          break;
        case "USER_UPDATED":
          if (sameUser)
            refreshSessionSilently(nextSession, { refetchProfile: true });
          else hydrateIdentity(nextSession);
          break;
        case "SIGNED_OUT":
          // Only clear if our own session is actually gone. With per-portal
          // storageKeys a sibling portal's signout uses a different
          // BroadcastChannel namespace and should not cascade here.
          if (!nextSession) {
            if (debounceTimer) clearTimeout(debounceTimer);
            currentUserIdRef.current = null;
            setSession(null);
            setUser(null);
            setMemberships([]);
            setProfile(null);
            setLoading(false);
          }
          break;
        case "PASSWORD_RECOVERY":
          break;
        default:
          break;
      }
    });

    supabase.auth.getSession().then(async ({ data: { session: initial } }) => {
      // INITIAL_SESSION may have already hydrated this same user via the
      // listener above — don't re-gate `loading` (and double-fetch) if so.
      if (initial?.user && initial.user.id === currentUserIdRef.current) {
        setSession(initial);
        setUser(initial.user);
        return;
      }
      currentUserIdRef.current = initial?.user?.id ?? null;
      setLoading(true);
      setSession(initial);
      setUser(initial?.user ?? null);

      if (initial?.user) {
        await fetchUserData(initial.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: (error as Error) ?? null };
  };

  const signUp = async (
    email: string,
    password: string,
    options: SignUpOptions = {},
  ) => {
    const { fullName } = options;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: fullName ?? null },
      },
    });
    if (error) return { error: error as Error };

    // No role is granted here: roles are per-organization. A fresh user has no
    // membership until they create an org (→ admin) or are invited to one.
    return { error: null };
  };

  const signOut = async () => {
    // Clear state first to avoid races with onAuthStateChange.
    currentUserIdRef.current = null;
    setUser(null);
    setSession(null);
    setMemberships([]);
    setProfile(null);

    // Hard-clear every per-portal token so a stale session can't resurrect.
    ALL_STORAGE_KEYS.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    });

    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch (error) {
      console.log("Signout API call failed (session may have expired):", error);
    }
  };

  const refreshProfile = async () => {
    let userId = user?.id ?? null;
    if (!userId) {
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;
    }
    if (userId) await fetchUserData(userId);
  };

  // Distinct roles across every organization the user belongs to.
  const roles = Array.from(new Set(memberships.map((m) => m.role)));
  const hasRole = (role: string) => roles.includes(role);
  const canAccessPortal = (portal: PortalId) => rolesCanAccessPortal(portal, roles);
  const isAuthenticated = !!user && !loading;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        profile,
        memberships,
        roles,
        isAuthenticated,
        hasRole,
        canAccessPortal,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
