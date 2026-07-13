import { PORTAL_LIST } from "@/config/portals";

/**
 * The Hub — a public landing that lets a user pick which app to enter, the
 * generic version of raimonland's persona switcher.
 *
 * Switching portals uses a FULL page load (window.location.assign), not client
 * navigation. This is REQUIRED: the Supabase client picks its per-portal auth
 * storageKey once at module init (see integrations/supabase/clientConfig.ts),
 * so the browser must reload for the correct portal session to take effect.
 */
const Hub = () => {
  const enter = (basePath: string) => {
    window.location.assign(basePath);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-semibold">po-template</h1>
          <p className="text-muted-foreground">
            Multi-app starter · React 18 + Vite + Supabase
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {PORTAL_LIST.map((p) => (
            <button
              key={p.id}
              onClick={() => enter(p.basePath)}
              className="rounded-lg border border-border bg-card p-5 text-left transition-colors hover:border-primary"
            >
              <h2 className="font-medium">{p.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {p.description}
              </p>
              <span className="mt-3 inline-block text-sm text-primary">
                Enter →
              </span>
            </button>
          ))}
        </div>

        {/* Organization management lives in the Web App portal (admins). Full
            reload so the Supabase client picks the web portal's storageKey. */}
        <div className="text-center">
          <button
            onClick={() => enter("/web/orgs")}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Manage organizations
          </button>
        </div>
      </div>
    </main>
  );
};

export default Hub;
