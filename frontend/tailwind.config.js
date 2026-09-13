/** @type {import('tailwindcss').Config} */

// Every colour is driven by a CSS variable holding an "R G B" triplet.
// index.css defines the light palette on :root and overrides it on .dark,
// so a single class like `bg-surface` is correct in both themes.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: token("surface"),
        "surface-dim": token("surface-dim"),
        "surface-lowest": token("surface-lowest"),
        "surface-low": token("surface-low"),
        "surface-container": token("surface-container"),
        "surface-high": token("surface-high"),
        "surface-highest": token("surface-highest"),

        "on-surface": token("on-surface"),
        "on-surface-variant": token("on-surface-variant"),

        outline: token("outline"),
        "outline-variant": token("outline-variant"),

        primary: token("primary"),
        "primary-bright": token("primary-bright"),
        "on-primary": token("on-primary"),
        "primary-fixed": token("primary-fixed"),

        secondary: token("secondary"),
        "secondary-container": token("secondary-container"),
        "on-secondary": token("on-secondary"),
        "secondary-fixed": token("secondary-fixed"),

        tertiary: token("tertiary"),
        "tertiary-bright": token("tertiary-bright"),
        "tertiary-fixed": token("tertiary-fixed"),

        lavender: token("lavender"),
        "lavender-fixed": token("lavender-fixed"),
        mint: token("mint"),
        "mint-fixed": token("mint-fixed"),

        error: token("error"),
        "error-container": token("error-container"),
        "on-error-container": token("on-error-container"),
      },

      fontFamily: {
        // Headlines / UI — modern grotesk
        display: ["Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        // Journal content — high-contrast literary serif
        journal: ['"Playfair Display"', "Georgia", "serif"],
        // Meta-data / annotations — unconventional edge
        annotation: ["Syne", "Inter", "sans-serif"],
      },

      fontSize: {
        // Display sizes pulled in a step: the old scale shouted on every page.
        "display-xl": ["56px", { lineHeight: "60px", letterSpacing: "-0.03em", fontWeight: "800" }],
        "display-lg": ["40px", { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-md": ["30px", { lineHeight: "36px", letterSpacing: "-0.015em", fontWeight: "700" }],
        "journal-body": ["20px", { lineHeight: "32px", fontWeight: "400" }],
        "journal-quote": ["28px", { lineHeight: "38px", fontWeight: "600" }],
        annotation: ["16px", { lineHeight: "20px", fontWeight: "600" }],
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.1em", fontWeight: "700" }],
        "label-caps-sm": ["10px", { lineHeight: "14px", letterSpacing: "0.12em", fontWeight: "700" }],
      },

      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },

      spacing: {
        unit: "8px",
        gutter: "24px",
        "margin-mobile": "20px",
        "margin-desktop": "64px",
        "stack-overlap": "-16px",
        sidebar: "256px",
      },

      boxShadow: {
        // Offset "stacked cardstock" shadows. Kept hard-edged — that's the
        // material language — but much lighter than before, so cards read as
        // paper on paper instead of as outlined stickers.
        paper: "2px 2px 0 0 rgb(var(--shadow-hard) / 0.10)",
        "paper-sm": "1px 1px 0 0 rgb(var(--shadow-hard) / 0.09)",
        "paper-lg": "3px 3px 0 0 rgb(var(--shadow-hard) / 0.10)",
        press: "2px 2px 0 0 rgb(var(--on-surface) / 0.55)",
        "press-primary": "2px 2px 0 0 rgb(var(--shadow-hard) / 0.22)",
        lifted: "0 14px 32px -22px rgb(var(--shadow-hard) / 0.35)",
      },

      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(3deg)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.7" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        "ink-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.8s infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite",
        "ink-in": "ink-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};
