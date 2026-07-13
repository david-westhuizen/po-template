import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

interface RoleGuardProps {
  children: ReactNode;
  /** Render children only if the user has ANY of these roles. */
  anyOf: string[];
  /** Optional fallback when the role check fails (defaults to a notice). */
  fallback?: ReactNode;
}

/**
 * Generic role gate — the vanilla equivalent of raimonland's ModuleGuard /
 * SettingsGuard. Use it to gate a section/route inside a portal by role, e.g.
 *   <RoleGuard anyOf={["admin"]}><SettingsPage /></RoleGuard>
 */
const RoleGuard = ({ children, anyOf, fallback }: RoleGuardProps) => {
  const { roles } = useAuth();
  const allowed = roles.some((r) => anyOf.includes(r));

  if (!allowed) {
    return (
      <>
        {fallback ?? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            You don&apos;t have permission to view this.
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
