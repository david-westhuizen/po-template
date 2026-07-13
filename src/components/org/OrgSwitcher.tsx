import { useActiveOrg } from "@/contexts/ActiveOrganizationContext";

/**
 * Compact active-org selector. Drop it in a portal header/dashboard so users
 * with multiple orgs can switch the scope they're operating in.
 */
const OrgSwitcher = () => {
  const { organizations, activeOrg, setActiveOrg } = useActiveOrg();

  if (organizations.length === 0) return null;

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Org</span>
      <select
        className="rounded-md border border-input bg-background px-2 py-1 text-sm"
        value={activeOrg?.orgId ?? ""}
        onChange={(e) => setActiveOrg(e.target.value)}
      >
        {organizations.map((o) => (
          <option key={o.orgId} value={o.orgId}>
            {o.orgName} ({o.role})
          </option>
        ))}
      </select>
    </label>
  );
};

export default OrgSwitcher;
