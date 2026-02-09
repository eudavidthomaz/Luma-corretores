import { useNavigate } from "react-router-dom";
import ligaLogoWhite from "@/assets/liga-logo-white.png";
import lumaLogoWhite from "@/assets/luma-logo-white.png";

export function LandingFooter() {
  const navigate = useNavigate();

  return (
    <footer className="relative z-10 px-4 sm:px-6 py-8 md:py-12 border-t border-luma-glass-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:gap-8">
          {/* Logo */}
          <div className="flex items-center gap-4 sm:gap-6">
            <img
              src={ligaLogoWhite}
              alt="Liga da Fotografia"
              className="h-10 sm:h-14 w-auto opacity-80"
            />
            <span className="text-muted-foreground text-lg">+</span>
            <img src={lumaLogoWhite} alt="Luma" className="h-8 sm:h-10 w-auto" />
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-muted-foreground">
            <button
              onClick={() => navigate("/auth")}
              className="relative hover:text-foreground transition-colors duration-200 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-foreground after:transition-all after:duration-300 hover:after:w-full"
            >
              Login
            </button>
            <a
              href="/privacy"
              className="relative hover:text-foreground transition-colors duration-200 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-foreground after:transition-all after:duration-300 hover:after:w-full"
            >
              Privacidade
            </a>
            <a
              href="/terms"
              className="relative hover:text-foreground transition-colors duration-200 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-foreground after:transition-all after:duration-300 hover:after:w-full"
            >
              Termos
            </a>
          </div>
        </div>

        <div className="text-center mt-8 pt-6 border-t border-luma-glass-border">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Liga da Fotografia. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
