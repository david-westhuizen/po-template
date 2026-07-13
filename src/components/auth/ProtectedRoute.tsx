import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PORTALS, type PortalId } from "@/config/portals";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Which portal this subtree belongs to (its sign-in page). */
  portal: PortalId;
}

/**
 * Authentication gate (mirrors raimonland's ProtectedRoute, split from access):
 *   - while auth resolves → full-screen loader
 *   - not signed in       → this portal's sign-in page
 *
 * Portal *access* (role/org membership) is enforced by PortalAccessGuard, so a
 * signed-in-but-unauthorized user gets a helpful screen (create org / no
 * access) instead of a silent bounce.
 */
const ProtectedRoute = ({ children, portal }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const cfg = PORTALS[portal];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate to={`${cfg.basePath}/auth`} state={{ from: location }} replace />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
