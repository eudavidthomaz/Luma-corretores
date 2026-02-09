import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        editorial: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        luma: {
          violet: "hsl(var(--luma-violet))",
          cyan: "hsl(var(--luma-cyan))",
          dark: "hsl(var(--luma-dark))",
          glass: "hsl(var(--luma-glass))",
          "glass-border": "hsl(var(--luma-glass-border))",
        },
        gallery: {
          background: "hsl(var(--gallery-background))",
          surface: "hsl(var(--gallery-surface))",
          text: "hsl(var(--gallery-text))",
          "text-muted": "hsl(var(--gallery-text-muted))",
          accent: "hsl(var(--gallery-accent))",
          "accent-highlight": "hsl(var(--gallery-accent-highlight))",
          "accent-deep": "hsl(var(--gallery-accent-deep))",
          border: "hsl(var(--gallery-border))",
          glass: "hsl(var(--gallery-glass))",
          "glass-subtle": "hsl(var(--gallery-glass-subtle))",
        },
        ivory: {
          base: "hsl(var(--ivory-base))",
          paper: "hsl(var(--ivory-paper))",
          warm: "hsl(35 30% 92%)",
        },
        gold: {
          deep: "hsl(var(--gold-deep))",
        },
        champagne: {
          gold: "hsl(var(--champagne-gold))",
          highlight: "hsl(var(--gold-highlight))",
          deep: "hsl(var(--gold-deep))",
        },
        charcoal: {
          ink: "hsl(var(--charcoal-ink))",
        },
        warm: {
          gray: "hsl(var(--warm-gray))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        glow: "0 0 40px hsl(var(--primary) / 0.3)",
        "glow-sm": "0 0 20px hsl(var(--primary) / 0.2)",
        "glow-cyan": "0 0 40px hsl(var(--secondary) / 0.3)",
        glass: "0 8px 32px hsl(0 0% 0% / 0.4)",
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-secondary": "var(--gradient-secondary)",
        "gradient-dark": "var(--gradient-dark)",
        "gradient-glass": "var(--gradient-glass)",
        "gradient-radial": "radial-gradient(ellipse at center, var(--tw-gradient-stops))",
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
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "shimmer-slow": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.4)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--primary) / 0.6)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "shimmer-slow": "shimmer-slow 3s ease-in-out infinite",
        "fade-slide-up": "fade-slide-up 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
