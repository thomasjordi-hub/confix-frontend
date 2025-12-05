/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],

  // WICHTIG: Tailwind nicht im OKLCH-Modus betreiben
  // Wir überschreiben alle Farben manuell auf sRGB
  theme: {
    extend: {},
    colors: {
      transparent: "transparent",
      current: "currentColor",

      white: "#ffffff",
      black: "#000000",

      gray: {
        50: "#f9fafb",
        100: "#f3f4f6",
        200: "#e5e7eb",
        300: "#d1d5db",
        400: "#9ca3af",
        500: "#6b7280",
        600: "#4b5563",
        700: "#374151",
        800: "#1f2937",
        900: "#111827",
      },

      red: {
        50: "#fef2f2",
        100: "#fee2e2",
        200: "#fecaca",
        300: "#fca5a5",
        400: "#f87171",
        500: "#ef4444",
        600: "#dc2626",
      },

      yellow: {
        400: "#facc15",
        500: "#eab308",
      },

      green: {
        500: "#22c55e",
        600: "#16a34a",
      },

      blue: {
        500: "#3b82f6",
        600: "#2563eb",
        700: "#1d4ed8",
      },
    },
  },

  plugins: [],
};
