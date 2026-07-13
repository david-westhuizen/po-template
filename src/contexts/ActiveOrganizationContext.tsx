import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type Membership } from "@/hooks/useAuth";
import { portalFromPathname } from "@/config/portals";

// The active org is namespaced per portal so signing into the Web App and a
// Mobile app in different tabs can each have their own active org.
const storageKey = () => {
  const portal =
    typeof window !== "undefined"
      ? portalFromPathname(window.location.pathname)
      : null;
  return `active_org:${portal?.id ?? "default"}`;
};

interface ActiveOrganizationContextType {
  /** All orgs the signed-in user belongs to (from their memberships). */
  organizations: Membership[];
  /** The currently-selected org, or null if the user has none. */
  activeOrg: Membership | null;
  /** The user's role in the active org (null if no active org). */
  activeRole: string | null;
  setActiveOrg: (orgId: string) => void;
  /** Create an org (caller becomes its admin) and select it. */
  createOrganization: (name: string) => Promise<{ error: Error | null }>;
  /**
   * Self-signup provisioning: create the caller's OWN workspace with a
   * non-privileged role (member/partner/…) and select it, so an end-user
   * lands straight in their app. Refused server-side for admin/manager.
   */
  provisionWorkspace: (
    role: string,
    name?: string,
  ) => Promise<{ error: Error | null }>;
}

const ActiveOrganizationContext = createContext<
  ActiveOrganizationContextType | undefined
>(undefined);

export const ActiveOrganizationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { memberships, refreshProfile } = useAuth();
  const [activeOrgId, setActiveOrgId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(storageKey());
  });

  // Keep the selection valid: if the stored/selected org isn't in the user's
  // memberships (e.g. after switching accounts), fall back to the first one.
  useEffect(() => {
    if (memberships.length === 0) {
      if (activeOrgId !== null) setActiveOrgId(null);
      return;
    }
    const stillValid = memberships.some((m) => m.orgId === activeOrgId);
    if (!stillValid) setActiveOrgId(memberships[0].orgId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberships]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (activeOrgId) window.localStorage.setItem(storageKey(), activeOrgId);
    else window.localStorage.removeItem(storageKey());
  }, [activeOrgId]);

  const setActiveOrg = (orgId: string) => setActiveOrgId(orgId);

  const createOrganization = async (name: string) => {
    const { data, error } = await supabase.rpc("create_organization", {
      _name: name,
    });
    if (error) return { error: error as Error };
    // Reload memberships so the new org (with the admin role) appears, then
    // select it.
    await refreshProfile();
    if (data?.id) setActiveOrgId(data.id);
    return { error: null };
  };

  const provisionWorkspace = async (role: string, name?: string) => {
    const workspaceName = name?.trim()
      ? `${name.trim()}'s workspace`
      : "My workspace";
    const { data, error } = await supabase.rpc("signup_create_workspace", {
      _role: role,
      _name: workspaceName,
    });
    if (error) return { error: error as Error };
    // Reload memberships so the new workspace (with its role) appears, then
    // select it — the portal guard re-renders into content.
    await refreshProfile();
    if (data?.id) setActiveOrgId(data.id);
    return { error: null };
  };

  const activeOrg = useMemo(
    () => memberships.find((m) => m.orgId === activeOrgId) ?? null,
    [memberships, activeOrgId],
  );

  return (
    <ActiveOrganizationContext.Provider
      value={{
        organizations: memberships,
        activeOrg,
        activeRole: activeOrg?.role ?? null,
        setActiveOrg,
        createOrganization,
        provisionWorkspace,
      }}
    >
      {children}
    </ActiveOrganizationContext.Provider>
  );
};

export const useActiveOrg = () => {
  const ctx = useContext(ActiveOrganizationContext);
  if (ctx === undefined) {
    throw new Error(
      "useActiveOrg must be used within an ActiveOrganizationProvider",
    );
  }
  return ctx;
};
