import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "@fontsource/plus-jakarta-sans/300.css";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import App from "./App.tsx";
import "./index.css";

// Register PWA Service Worker with auto-update
const updateSW = registerSW({
  onNeedRefresh() {
    // Auto-refresh when new version is available
    console.log("[PWA] New content available, refreshing...");
    updateSW(true);
  },
  onOfflineReady() {
    console.log("[PWA] App ready to work offline");
  },
  onRegistered(registration) {
    console.log("[PWA] Service Worker registered:", registration?.scope);
  },
  onRegisterError(error) {
    console.error("[PWA] Service Worker registration error:", error);
  },
});

createRoot(document.getElementById("root")!).render(<App />);
