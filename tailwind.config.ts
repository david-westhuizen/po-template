import animate from "tailwindcss-animate";
// Konsta UI (the mobile apps' design system) wraps this Tailwind config: it
// injects the iOS + Material component styles and appends its own content
// globs. It ships no types and this file isn't type-checked, so a plain
// default import is fine.
import konstaConfig from "konsta/config";

/**
 * Design-token seam (same mechanism as raimonland).
 *
 * The WEB back-office (/web) uses shadcn primitives driven by the HSL CSS
 * variables in `src/index.css` — override those variables to restyle it.
 * The MOBILE apps (app1 / app2) use Konsta UI (see `konsta` key below).
 * `npx shadcn@latest add <component>` expects exactly this token setup.
 */
const config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  // Konsta's brand color for the mobile apps. Mirrors `--primary` in
  // src/index.css (222.2 47.4% 11.2% → #0f172a) so web + mobile share one
  // brand. Keep the two in sync — the /setup wizard updates both.
  konsta: {
    colors: {
      primary: "#0f172a",
    },
  },
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default konstaConfig(config);
