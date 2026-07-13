import { QueryClient, QueryClientProvider, keepPreviousData } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Component, ErrorInfo, ReactNode, lazy, Suspense } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { ActiveOrganizationProvider } from "@/contexts/ActiveOrganizationContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PortalAccessGuard from "@/components/auth/PortalAccessGuard";

// Pages are lazy-loaded (like raimonland) so each portal is its own bundle.
const Hub = lazy(() => import("./pages/Hub"));
const NotFound = lazy(() => import("./pages/NotFound"));

const WebAuth = lazy(() => import("./pages/web/WebAuth"));
const WebDashboard = lazy(() => import("./pages/web/WebDashboard"));
const OrgsPage = lazy(() => import("./pages/web/OrgsPage"));

const App1Auth = lazy(() => import("./pages/app1/App1Auth"));
const App1Dashboard = lazy(() => import("./pages/app1/App1Dashboard"));

const App2Auth = lazy(() => import("./pages/app2/App2Auth"));
const App2Dashboard = lazy(() => import("./pages/app2/App2Dashboard"));

// React Query is the client cache; together with Supabase Realtime
// (src/hooks/useRealtimeSync.ts) it forms the "event bus" of this architecture.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      placeholderData: keepPreviousData,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ padding: 24 }}>Something went wrong.</div>;
    }
    return this.props.children;
  }
}

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <p className="text-muted-foreground">Loading…</p>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ActiveOrganizationProvider>
          <ErrorBoundary>
            {/* Add global providers (TooltipProvider, Toaster) here. */}
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                {/* Public */}
                <Route path="/" element={<Hub />} />

                {/* Web App portal */}
                <Route path="/web/auth" element={<WebAuth />} />
                <Route
                  path="/web"
                  element={
                    <ProtectedRoute portal="web">
                      <PortalAccessGuard portal="web">
                        <WebDashboard />
                      </PortalAccessGuard>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/web/orgs"
                  element={
                    <ProtectedRoute portal="web">
                      <PortalAccessGuard portal="web">
                        <OrgsPage />
                      </PortalAccessGuard>
                    </ProtectedRoute>
                  }
                />

              {/* Mobile App 1 portal */}
              <Route path="/app1/auth" element={<App1Auth />} />
              <Route
                path="/app1"
                element={
                  <ProtectedRoute portal="app1">
                    <PortalAccessGuard portal="app1">
                      <App1Dashboard />
                    </PortalAccessGuard>
                  </ProtectedRoute>
                }
              />

              {/* Mobile App 2 portal */}
              <Route path="/app2/auth" element={<App2Auth />} />
              <Route
                path="/app2"
                element={
                  <ProtectedRoute portal="app2">
                    <PortalAccessGuard portal="app2">
                      <App2Dashboard />
                    </PortalAccessGuard>
                  </ProtectedRoute>
                }
              />

              {/* Dev-only: preview the mobile apps' UI (phone frame + iOS/
                  Android toggle) WITHOUT auth. Stripped from production builds. */}
              {import.meta.env.DEV && (
                <>
                  <Route path="/preview/app1" element={<App1Dashboard />} />
                  <Route path="/preview/app2" element={<App2Dashboard />} />
                </>
              )}

              <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </ActiveOrganizationProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
