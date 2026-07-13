import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useActiveOrg } from "@/contexts/ActiveOrganizationContext";
import OrgSwitcher from "@/components/org/OrgSwitcher";
import { PORTALS, type PortalId } from "@/config/portals";

interface PortalDashboardProps {
  portal: PortalId;
}

/**
 * Placeholder portal home. Replace with the real feature UI — feature
 * components live in src/components/<feature>/, backed by hooks in src/hooks/
 * and domain logic in src/lib/<feature>/. Data is scoped by the active org
 * (useActiveOrg): filter queries by activeOrg.orgId and stamp inserts with it.
 */
const PortalDashboard = ({ portal }: PortalDashboardProps) => {
  const cfg = PORTALS[portal];
  const { profile, user, signOut } = useAuth();
  const { activeOrg, activeRole } = useActiveOrg();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl flex items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold">{cfg.label}</h1>
            <p className="text-xs text-muted-foreground">{cfg.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <OrgSwitcher />
            <button
              onClick={signOut}
              className="rounded-md border border-input px-3 py-1.5 text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-8 space-y-3">
        <p className="text-sm">
          Signed in as{" "}
          <span className="font-medium">
            {profile?.full_name || profile?.email || user?.email}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          Active organization:{" "}
          <span className="font-medium text-foreground">
            {activeOrg ? activeOrg.orgName : "(none)"}
          </span>
          {activeRole ? ` · role: ${activeRole}` : ""}
        </p>

        {portal === "web" && (
          <p className="text-sm">
            <Link
              to="/web/orgs"
              className="text-primary underline underline-offset-4"
            >
              Manage organizations →
            </Link>
          </p>
        )}

        <p className="text-sm text-muted-foreground pt-2">
          Build this portal&apos;s features here.
        </p>
      </section>
    </main>
  );
};

export default PortalDashboard;
