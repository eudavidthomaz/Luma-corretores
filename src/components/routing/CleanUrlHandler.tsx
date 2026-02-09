import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/NotFound";

// Domínios que usam Clean URLs (sem /p/ prefix)
const CLEAN_URL_DOMAINS = ["saibamais.app", "www.saibamais.app"];

// Rotas reservadas que NÃO devem ser tratadas como slugs
const RESERVED_ROUTES = [
  "/admin",
  "/auth",
  "/chat",
  "/embed",
  "/p/",
  "/g/",
  "/proposta/",
  "/privacy",
  "/terms",
];

export function CleanUrlHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const hostname = window.location.hostname;
  const path = location.pathname;

  // Check if we're on a clean URL domain
  const isCleanUrlDomain = CLEAN_URL_DOMAINS.includes(hostname);

  // Check if the path is a reserved route
  const isReservedRoute = RESERVED_ROUTES.some(
    (route) => path === route || path.startsWith(route)
  );

  // On clean URL domains, block admin/auth routes (security)
  useEffect(() => {
    if (isCleanUrlDomain) {
      if (path.startsWith("/admin") || path === "/auth") {
        navigate("/", { replace: true });
      }
    }
  }, [isCleanUrlDomain, path, navigate]);

  // Root of clean URL domain redirects to showcase
  useEffect(() => {
    if (isCleanUrlDomain && path === "/") {
      navigate("/p/afterfotografia", { replace: true });
    }
  }, [isCleanUrlDomain, path, navigate]);

  // If on clean URL domain and path is not reserved
  if (isCleanUrlDomain && !isReservedRoute && path !== "/") {
    // Extract slug from path (e.g., /after -> after)
    const slug = path.substring(1); // Remove leading slash
    
    // If slug is valid (no nested paths), render profile
    if (slug && !slug.includes("/")) {
      return <ProfilePage />;
    }
  }

  // Default: show 404
  return <NotFound />;
}
