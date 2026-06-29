/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#07143B",
          surface: "rgba(3, 16, 55, 0.6)",
          border: "rgba(255, 255, 255, 0.08)",
          primary: "#2563EB",
          primaryHover: "#3B82F6",
          accent: "#6366F1",
          textLight: "#eeefff",
          textMuted: "#c3c6d7",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        "primary-container": "#2563eb",
        "surface-container-highest": "#27335a",
        "surface": "#031037",
        "on-surface-variant": "#c3c6d7",
        "on-primary-fixed-variant": "#003ea8",
        "surface-container-low": "#0c1940",
        "on-tertiary-fixed": "#07006c",
        "primary-fixed-dim": "#b4c5ff",
        "on-error-container": "#ffdad6",
        "on-secondary-fixed-variant": "#004395",
        "surface-container-high": "#1c284f",
        "surface-container-lowest": "#000a31",
        "on-secondary-fixed": "#001a42",
        "on-secondary-container": "#e6ecff",
        "outline": "#8d90a0",
        "on-secondary": "#002e6a",
        "inverse-surface": "#dce1ff",
        "secondary-fixed": "#d8e2ff",
        "on-error": "#690005",
        "secondary-fixed-dim": "#adc6ff",
        "tertiary-container": "#585be6",
        "surface-dim": "#031037",
        "surface-container": "#111d44",
        "surface-tint": "#b4c5ff",
        "on-tertiary-fixed-variant": "#2f2ebe",
        "on-tertiary-container": "#f1eeff",
        "on-tertiary": "#1000a9",
        "inverse-on-surface": "#232e56",
        "error": "#ffb4ab",
        "on-primary": "#002a78",
        "surface-bright": "#2c375f",
        "surface-variant": "#27335a",
        "inverse-primary": "#0053db",
        "secondary-container": "#0566d9",
        "primary-fixed": "#dbe1ff",
        "on-primary-container": "#eeefff",
        "tertiary-fixed-dim": "#c0c1ff",
        "error-container": "#93000a",
        "on-background": "#dce1ff",
        "tertiary-fixed": "#e1e0ff",
        "tertiary": "#c0c1ff",
        "on-surface": "#dce1ff",
        "outline-variant": "#434655",
        "on-primary-fixed": "#00174b"
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        display: ["Outfit", "sans-serif"]
      },
      backdropBlur: {
        glass: "12px",
        glassModal: "20px"
      }
    },
  },
  plugins: [],
}
