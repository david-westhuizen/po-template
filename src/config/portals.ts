// ---------------------------------------------------------------------------
// Multi-portal configuration (generic, raimonland-modelled).
//
// raimonland ships THREE apps from one codebase (an admin web portal + two
// end-user apps) that share one Supabase project but must NOT share an auth
// session in the same browser. This file is the single source of truth for
// those portals. Rename/add/remove portals here and the storage-key isolation,
// routing guards, and Hub switcher all follow.
//
// The three portals below are deliberately generic — a back-office "Web App"
// plus two "Mobile" apps — so this template drops into any future project.
// ---------------------------------------------------------------------------

export type PortalId = "web" | "app1" | "app2";

export interface PortalConfig {
  id: PortalId;
  /** Human label shown on the Hub. */
  label: string;
  description: string;
  /** URL prefix for this portal's routes, e.g. "/web". */
  basePath: string;
  /** Supabase auth storage key — MUST be unique per portal (session isolation). */
  storageKey: string;
  /** Whether this portal exposes self-signup. */
  allowSignup: boolean;
  /**
   * Per-org roles that may ENTER this portal. A user is admitted if ANY of
   * their organization memberships holds one of these roles.
   */
  allowedRoles: string[];
  /**
   * Role auto-granted (in the user's OWN new workspace) when they self-sign-up
   * on this portal, so they land straight in the app. Omit for portals that
   * use the interactive create-org bootstrap instead (e.g. the admin web app).
   * Never a privileged role — signup_create_workspace refuses admin/manager
   * server-side.
   */
  signupRole?: string;
}

// Change this once to namespace every storage key for a new project.
const STORAGE_KEY_PREFIX = "sb-app";

export const PORTALS: Record<PortalId, PortalConfig> = {
  web: {
    id: "web",
    label: "Web App",
    description: "Back-office / desktop portal",
    basePath: "/web",
    storageKey: `${STORAGE_KEY_PREFIX}-web-auth`,
    // Signup enabled so a new user can bootstrap: sign up → create an
    // organization → become its admin (see the create-org onboarding).
    allowSignup: true,
    allowedRoles: ["admin", "manager"],
  },
  app1: {
    id: "app1",
    label: "Mobile App 1",
    description: "End-user application A",
    basePath: "/app1",
    storageKey: `${STORAGE_KEY_PREFIX}-app1-auth`,
    allowSignup: true,
    allowedRoles: ["member"],
    signupRole: "member",
  },
  app2: {
    id: "app2",
    label: "Mobile App 2",
    description: "End-user application B",
    basePath: "/app2",
    storageKey: `${STORAGE_KEY_PREFIX}-app2-auth`,
    allowSignup: true,
    allowedRoles: ["partner"],
    signupRole: "partner",
  },
};

export const PORTAL_LIST: PortalConfig[] = Object.values(PORTALS);

export const DEFAULT_STORAGE_KEY = `${STORAGE_KEY_PREFIX}-default`;

/** Every key we might have written — used to hard-clear on sign-out. */
export const ALL_STORAGE_KEYS: readonly string[] = [
  ...PORTAL_LIST.map((p) => p.storageKey),
  DEFAULT_STORAGE_KEY,
];

/** Resolve which portal a given pathname belongs to (null = Hub/public). */
export function portalFromPathname(pathname: string): PortalConfig | null {
  return (
    PORTAL_LIST.find(
      (p) => pathname === p.basePath || pathname.startsWith(`${p.basePath}/`),
    ) ?? null
  );
}

/** Does a user holding `roles` have access to `portal`? */
export function rolesCanAccessPortal(portal: PortalId, roles: string[]): boolean {
  return roles.some((r) => PORTALS[portal].allowedRoles.includes(r));
}
