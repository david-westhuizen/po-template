import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// This is the app bootstrap. In raimonland, one-time side-effect bootstraps
// (theme mode, custom fonts, favicon, brand lab) are called here BEFORE render.
// Add your own bootstrap calls above createRoot when you need them, e.g.:
//   import { bootstrapThemeMode } from "@/hooks/useThemeMode";
//   bootstrapThemeMode();

createRoot(document.getElementById("root")!).render(<App />);
