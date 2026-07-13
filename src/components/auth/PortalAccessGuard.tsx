import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PORTALS, type PortalId } from "@/config/portals";
import CreateOrgPrompt from "@/components/org/CreateOrgPrompt";

interface PortalAccessGuardProps {
  children: ReactNode;
  portal: PortalId;
}

/**
 * Portal access gate (runs inside ProtectedRoute, so the user is already
 * authenticated). Decides, from the user's org memberships:
 *   - has an allowed role for this portal → render the portal
 *   - belongs to NO org                   → create-org onboarding
 *   - belongs to org(s) but wrong role    → no-access screen
 */
const PortalAccessGuard = ({ children, portal }: PortalAccessGuardProps) => {
  const { canAccessPortal, memberships } = useAuth();

  if (canAccessPortal(portal)) return <>{children}</>;

  if (memberships.length === 0) return <CreateOrgPrompt />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center space-y-2 max-w-sm">
        <h1 className="text-xl font-semibold">No access</h1>
        <p className="text-muted-foreground text-sm">
          Your organization role doesn&apos;t grant access to{" "}
          {PORTALS[portal].label}.
        </p>
        <p className="text-sm">
          <Link to="/" className="text-primary underline underline-offset-4">
            ← All apps
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PortalAccessGuard;
