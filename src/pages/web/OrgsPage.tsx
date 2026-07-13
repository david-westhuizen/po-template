import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useActiveOrg } from "@/contexts/ActiveOrganizationContext";

/**
 * Organization management (Web App portal). Lists the orgs you belong to, lets
 * you switch the active one, and create a new org (you become its admin).
 *
 * Extension points: rename/delete an org (RLS already allows admins to update),
 * and an "invite member by email" flow (add an add_org_member RPC).
 */
const OrgsPage = () => {
  const { organizations, activeOrg, setActiveOrg, createOrganization } =
    useActiveOrg();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await createOrganization(name.trim());
    setBusy(false);
    if (error) setError(error.message);
    else setName("");
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold">Organizations</h1>
          <Link
            to="/web"
            className="text-sm text-primary underline underline-offset-4"
          >
            ← Web App
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-8 space-y-8">
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Your organizations
          </h2>
          {organizations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You don&apos;t belong to any organization yet.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {organizations.map((o) => (
                <li
                  key={o.orgId}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{o.orgName}</p>
                    <p className="text-xs text-muted-foreground">
                      Your role: {o.role}
                    </p>
                  </div>
                  {o.orgId === activeOrg?.orgId ? (
                    <span className="text-xs text-primary">Active</span>
                  ) : (
                    <button
                      onClick={() => setActiveOrg(o.orgId)}
                      className="rounded-md border border-input px-3 py-1 text-xs"
                    >
                      Switch to
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={onCreate} className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Create a new organization
          </h2>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Organization name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={busy || !name.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {busy ? "…" : "Create"}
            </button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>
      </section>
    </main>
  );
};

export default OrgsPage;
