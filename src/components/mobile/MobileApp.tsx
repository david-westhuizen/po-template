import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { App } from "konsta/react";
import DeviceFrame from "@/components/mobile/DeviceFrame";

/**
 * Root wrapper for the MOBILE apps (app1 / app2).
 *
 * The web back-office (/web) uses shadcn + Tailwind. The mobile apps use
 * Konsta UI, which renders native-style components and — via the `<App theme>`
 * prop — BOTH an iOS ("cupertino") and a Material (Android) look from the same
 * code.
 *
 * We present them inside a realistic phone mockup (DeviceFrame) on desktop, so
 * the preview reads like a real device (à la Figma/Canva). The iOS/Android
 * switch lives on the "stage" beside the device. Default is iOS; the choice is
 * persisted to localStorage. See ARCHITECTURE.md ("Design systems").
 */

export type MobilePlatform = "ios" | "material";

const STORAGE_KEY = "mobile-preview-platform";

interface MobilePlatformContextValue {
  platform: MobilePlatform;
  setPlatform: (p: MobilePlatform) => void;
  toggle: () => void;
}

const MobilePlatformContext =
  createContext<MobilePlatformContextValue | null>(null);

/** Read/set the current mobile look (iOS vs Material). */
export const useMobilePlatform = (): MobilePlatformContextValue => {
  const ctx = useContext(MobilePlatformContext);
  if (!ctx) {
    throw new Error("useMobilePlatform must be used within <MobileApp>");
  }
  return ctx;
};

const readStored = (): MobilePlatform => {
  if (typeof window === "undefined") return "ios";
  return window.localStorage.getItem(STORAGE_KEY) === "material"
    ? "material"
    : "ios";
};

/** Figma-style device picker, shown on the stage (desktop only). */
const PlatformSwitcher = () => {
  const { platform, setPlatform } = useMobilePlatform();
  const options: { id: MobilePlatform; label: string }[] = [
    { id: "ios", label: "iOS" },
    { id: "material", label: "Android" },
  ];
  return (
    <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => setPlatform(o.id)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            platform === o.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
};

const MobileApp = ({ children }: { children: ReactNode }) => {
  const [platform, setPlatform] = useState<MobilePlatform>(readStored);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, platform);
  }, [platform]);

  const toggle = () =>
    setPlatform((p) => (p === "ios" ? "material" : "ios"));

  return (
    <MobilePlatformContext.Provider value={{ platform, setPlatform, toggle }}>
      {/* The "stage": a neutral desk that makes the device pop (desktop). */}
      <div className="min-h-svh w-full bg-muted/40 md:flex md:flex-col md:items-center md:justify-center md:gap-5 md:py-8">
        <div className="hidden md:block">
          <PlatformSwitcher />
        </div>

        <DeviceFrame platform={platform}>
          {/* theme drives the entire iOS ⇄ Material look. The App fills the
              device screen; safe areas + notch are handled by the frame. */}
          <App
            theme={platform}
            dark={false}
            safeAreas={false}
            className="!min-h-0 flex h-full w-full flex-col md:pb-3"
          >
            {children}
          </App>
        </DeviceFrame>
      </div>
    </MobilePlatformContext.Provider>
  );
};

export default MobileApp;
