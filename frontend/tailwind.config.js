/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          dark: "#1d4ed8",
          light: "#eff6ff",
        },

        secondary: {
          DEFAULT: "#0f172a",
          light: "#f8fafc",
        },

        accent: {
          DEFAULT: "#7c3aed",
          light: "#ede9fe",
        },

        success: {
          DEFAULT: "#16a34a",
          light: "#f0fdf4",
        },

        danger: {
          DEFAULT: "#dc2626",
          light: "#fef2f2",
        },

        muted: {
          DEFAULT: "#64748b",
          light: "#94a3b8",
        },

        surface: "#ffffff",
        background: "#f6f5f2",
      },

      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },

      boxShadow: {
        soft: "0 4px 14px rgba(15, 23, 42, 0.08)",
        card: "0 8px 30px rgba(15, 23, 42, 0.06)",
      },

      borderRadius: {
        xl2: "1rem",
      },

      screens: {
        xs: "480px",
      },

      animation: {
        fadeIn: "fadeIn 0.3s ease-in-out",
        slideUp: "slideUp 0.35s ease-out",
      },

      keyframes: {
        fadeIn: {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },

        slideUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
    },
  },

  plugins: [],
};