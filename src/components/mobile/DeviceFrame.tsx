import { useEffect, useState, type ReactNode } from "react";
import { Wifi, BatteryFull, SignalHigh } from "lucide-react";
import type { MobilePlatform } from "@/components/mobile/MobileApp";

/**
 * A realistic phone device mockup (à la Figma/Canva) that frames the mobile
 * app. Platform-aware: an iPhone shell (rounded bezel + Dynamic Island + home
 * indicator) for iOS, an Android shell (squarer bezel + centered punch-hole)
 * for Material. On phones (< md) it renders full-bleed with no chrome.
 *
 * The `children` (the Konsta <App>) fill the screen area, which is a positioned,
 * overflow-hidden box — exactly what Konsta's absolutely-positioned Page needs.
 */

function formatNow(): string {
  const d = new Date();
  const h = d.getHours() % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function useStatusTime(): string {
  const [t, setT] = useState(formatNow);
  useEffect(() => {
    const id = window.setInterval(() => setT(formatNow()), 15_000);
    return () => window.clearInterval(id);
  }, []);
  return t;
}

const StatusBar = () => {
  const time = useStatusTime();
  return (
    <div className="relative z-40 flex h-11 shrink-0 items-center justify-between px-7 text-foreground">
      <span className="text-sm font-semibold tabular-nums">{time}</span>
      <div className="flex items-center gap-1.5">
        <SignalHigh className="h-4 w-4" />
        <Wifi className="h-4 w-4" />
        <BatteryFull className="h-[18px] w-[18px]" />
      </div>
    </div>
  );
};

const DeviceFrame = ({
  platform,
  children,
}: {
  platform: MobilePlatform;
  children: ReactNode;
}) => {
  const isIOS = platform === "ios";

  return (
    <div className="relative">
      {/* Physical side buttons (desktop mockup only) */}
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        {/* left: silent switch + volume up/down */}
        <span className="absolute -left-[2px] top-[13%] h-[3%] w-[3px] rounded-l bg-neutral-700" />
        <span className="absolute -left-[2px] top-[19%] h-[7%] w-[3px] rounded-l bg-neutral-700" />
        <span className="absolute -left-[2px] top-[28%] h-[7%] w-[3px] rounded-l bg-neutral-700" />
        {/* right: power */}
        <span className="absolute -right-[2px] top-[23%] h-[10%] w-[3px] rounded-r bg-neutral-700" />
      </div>

      {/* Device body */}
      <div
        className={[
          // transform-gpu makes Konsta's position:fixed overlays (Sheet,
          // Dialog, Toast, …) stay INSIDE the phone frame instead of the
          // browser viewport — a transformed ancestor becomes their containing
          // block. Needed for any overlay used in a mobile screen.
          "relative overflow-hidden bg-background transform-gpu",
          "h-[100svh] w-full", // full-bleed on phones
          "md:h-[calc(100svh-7rem)] md:max-h-[860px] md:w-auto md:aspect-[390/844]",
          "md:shadow-2xl md:ring-1 md:ring-black/10",
          isIOS
            ? "md:rounded-[3.2rem] md:border-[12px] md:border-neutral-950"
            : "md:rounded-[2.2rem] md:border-[10px] md:border-neutral-900",
        ].join(" ")}
      >
        <div className="relative flex h-full w-full flex-col">
          {/* iOS Dynamic Island / Android punch-hole (desktop only) */}
          {isIOS ? (
            <div className="pointer-events-none absolute left-1/2 top-[10px] z-50 hidden h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black md:block" />
          ) : (
            <div className="pointer-events-none absolute left-1/2 top-[10px] z-50 hidden h-[11px] w-[11px] -translate-x-1/2 rounded-full bg-black ring-2 ring-black/20 md:block" />
          )}

          {/* Faux status bar (desktop only) */}
          <div className="hidden md:block">
            <StatusBar />
          </div>

          {/* App content fills the rest */}
          <div className="relative min-h-0 flex-1">{children}</div>

          {/* Home indicator / gesture pill (desktop only) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-1.5 z-50 hidden justify-center md:flex">
            <div
              className={
                isIOS
                  ? "h-1 w-32 rounded-full bg-foreground/40"
                  : "h-1 w-24 rounded-full bg-foreground/30"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceFrame;
