import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useActiveOrg } from "@/contexts/ActiveOrganizationContext";

/**
 * Shown when a signed-in user belongs to NO organization. Creating one makes
 * them its admin (via the create_organization RPC), which grants access to the
 * Web App portal. End-user apps (member/partner roles) are joined by invite —
 * add an invite flow when you need it.
 */
const CreateOrgPrompt = () => {
  const { createOrganization } = useActiveOrg();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await createOrganization(name.trim());
    setBusy(false);
    if (error) setError(error.message);
    // On success the memberships refresh and the guard re-renders into content.
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold">Create your organization</h1>
          <p className="text-sm text-muted-foreground">
            You&apos;re not part of an organization yet. Create one to get
            started — you&apos;ll be its admin.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Organization name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create organization"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          <Link to="/" className="underline underline-offset-4">
            ← All apps
          </Link>
        </p>
      </div>
    </main>
  );
};

export default CreateOrgPrompt;
