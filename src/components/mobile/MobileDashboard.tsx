import { useState, type ComponentType } from "react";
import {
  Navbar,
  Block,
  BlockTitle,
  List,
  ListItem,
  ListInput,
  Button,
  Sheet,
  Tabbar,
  TabbarLink,
} from "konsta/react";
import {
  Home,
  Search,
  Bell,
  User,
  Building2,
  Inbox,
  type LucideProps,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useActiveOrg } from "@/contexts/ActiveOrganizationContext";
import { PORTALS, type PortalId } from "@/config/portals";

/**
 * Reference home screen for the mobile apps (app1 / app2), built with Konsta UI
 * and following the mobile-design skill: one job per screen, a working bottom
 * tab bar, honest empty states with a thumb-reachable primary action, and
 * account actions under Profile. Copy this shape for real screens; swap the
 * placeholder "Quick actions"/empty copy for your feature content.
 */

type Tab = "home" | "explore" | "alerts" | "profile";

/** Centered empty state — fills the screen with intent instead of dead space. */
const EmptyState = ({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: ComponentType<LucideProps>;
  title: string;
  body: string;
  action?: React.ReactNode;
}) => (
  <div className="flex min-h-full flex-col items-center justify-center px-8 py-10 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Icon className="h-8 w-8" />
    </div>
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="mt-1 text-sm opacity-60">{body}</p>
    {action && <div className="mt-6 w-full max-w-xs">{action}</div>}
  </div>
);

const MobileDashboard = ({ portal }: { portal: PortalId }) => {
  const cfg = PORTALS[portal];
  const { profile, user, signOut } = useAuth();
  const { activeOrg, activeRole } = useActiveOrg();
  const [tab, setTab] = useState<Tab>("home");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [code, setCode] = useState("");

  const displayName =
    profile?.full_name || profile?.email || user?.email || "there";
  const firstName = displayName.split(/[\s@]/)[0];
  const neutralTitle = { textMaterial: "text-md-light-on-surface" };

  return (
    <>
      <Navbar title={cfg.label} />

      {/* Only the content region scrolls; Navbar + Tabbar stay fixed. */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "home" &&
          (activeOrg ? (
            <>
              <Block>
                <p className="text-xl font-semibold">Hi, {firstName} 👋</p>
                <p className="text-sm opacity-60">
                  Welcome back to {activeOrg.orgName}
                </p>
              </Block>
              <BlockTitle colors={neutralTitle}>Quick actions</BlockTitle>
              <List strong inset>
                <ListItem link title="Placeholder action" onClick={() => {}} />
                <ListItem link title="Another action" onClick={() => {}} />
              </List>
              <Block className="text-sm opacity-60">
                Replace these with your app&apos;s real features.
              </Block>
            </>
          ) : (
            <EmptyState
              icon={Building2}
              title="No organization yet"
              body="Customer access is invite-only. Enter an invite code to join your organization."
              action={
                <Button onClick={() => setInviteOpen(true)}>
                  Enter invite code
                </Button>
              }
            />
          ))}

        {tab === "explore" && (
          <EmptyState
            icon={Search}
            title="Nothing to explore yet"
            body="Content will appear here once it's available."
          />
        )}

        {tab === "alerts" && (
          <EmptyState
            icon={Inbox}
            title="You're all caught up"
            body="New alerts will show up here."
          />
        )}

        {tab === "profile" && (
          <>
            <Block>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">
                    {displayName}
                  </p>
                  {user?.email && (
                    <p className="truncate text-sm opacity-60">{user.email}</p>
                  )}
                </div>
              </div>
            </Block>
            <List strong inset>
              <ListItem
                title="Organization"
                after={activeOrg ? activeOrg.orgName : "None yet"}
              />
              {activeRole && <ListItem title="Role" after={activeRole} />}
            </List>
            <Block>
              <Button outline onClick={signOut}>
                Sign out
              </Button>
            </Block>
          </>
        )}
      </div>

      <Tabbar labels className="shrink-0">
        <TabbarLink
          active={tab === "home"}
          onClick={() => setTab("home")}
          icon={<Home className="h-6 w-6" />}
          label="Home"
        />
        <TabbarLink
          active={tab === "explore"}
          onClick={() => setTab("explore")}
          icon={<Search className="h-6 w-6" />}
          label="Explore"
        />
        <TabbarLink
          active={tab === "alerts"}
          onClick={() => setTab("alerts")}
          icon={<Bell className="h-6 w-6" />}
          label="Alerts"
        />
        <TabbarLink
          active={tab === "profile"}
          onClick={() => setTab("profile")}
          icon={<User className="h-6 w-6" />}
          label="Profile"
        />
      </Tabbar>

      {/* Quick focused task → bottom sheet (per the mobile-design skill). */}
      <Sheet
        opened={inviteOpen}
        onBackdropClick={() => setInviteOpen(false)}
        className="w-full pb-safe"
      >
        <div className="mx-auto mt-2 mb-1 h-1 w-10 rounded-full bg-black/15" />
        <Block>
          <p className="text-base font-semibold">Join an organization</p>
          <p className="text-sm opacity-60">
            Enter the invite code your admin gave you.
          </p>
        </Block>
        <List strong inset>
          <ListInput
            label="Invite code"
            type="text"
            placeholder="e.g. ABC-123"
            value={code}
            onInput={(e) => setCode((e.target as HTMLInputElement).value)}
          />
        </List>
        <Block>
          <Button onClick={() => setInviteOpen(false)}>Join</Button>
          <p className="mt-2 text-center text-xs opacity-50">
            Wire this button up to your invite/join flow.
          </p>
        </Block>
      </Sheet>
    </>
  );
};

export default MobileDashboard;
