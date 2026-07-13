import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useActiveOrg } from "@/contexts/ActiveOrganizationContext";
import { PORTALS, type PortalId } from "@/config/portals";

interface PortalAuthFormProps {
  portal: PortalId;
}

/**
 * Generic email/password sign-in + sign-up form, parameterized by portal.
 * Deliberately plain HTML + Tailwind tokens (no component library) so the
 * design-system seam stays open. Swap these inputs for your shadcn/ui or own
 * components later.
 */
const PortalAuthForm = ({ portal }: PortalAuthFormProps) => {
  const cfg = PORTALS[portal];
  const { signIn, signUp } = useAuth();
  const { provisionWorkspace } = useActiveOrg();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    if (mode === "signin") {
      const { error } = await signIn(email, password);
      setBusy(false);
      if (error) return setError(error.message);
      navigate(cfg.basePath, { replace: true });
      return;
    }

    // Sign up, then — for end-user portals — auto-provision the signer's own
    // workspace with this portal's role so they land straight in. The admin
    // web app has no signupRole: it uses the interactive create-org onboarding.
    const { error: signUpError } = await signUp(email, password, { fullName });
    if (signUpError) {
      setBusy(false);
      return setError(signUpError.message);
    }
    if (cfg.signupRole) {
      const { error: provisionError } = await provisionWorkspace(
        cfg.signupRole,
        fullName,
      );
      if (provisionError) {
        setBusy(false);
        return setError(provisionError.message);
      }
    }
    setBusy(false);
    // The auth listener hydrates and the portal's ProtectedRoute takes over.
    navigate(cfg.basePath, { replace: true });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold">{cfg.label}</h1>
          <p className="text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to continue" : "Create your account"}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {busy ? "…" : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>

        {cfg.allowSignup && (
          <p className="text-center text-sm text-muted-foreground">
            {mode === "signin" ? "No account?" : "Have an account?"}{" "}
            <button
              className="text-primary underline underline-offset-4"
              onClick={() => {
                setError(null);
                setMode(mode === "signin" ? "signup" : "signin");
              }}
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        )}

        <p className="text-center text-xs text-muted-foreground">
          <Link to="/" className="underline underline-offset-4">
            ← All apps
          </Link>
        </p>
      </div>
    </main>
  );
};

export default PortalAuthForm;
