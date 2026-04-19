/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#0F172A",
        surface: "#1A2A47",
        border: "#2D4178",
        accent: "#7C3AED",
        "accent-light": "#A78BFA",
        muted: "#6B7280",
        text: "#F1F5F9",
        "text-dim": "#CBD5E1",
      },
      fontFamily: {
        sans: ["SpaceGrotesk-Regular"],
        medium: ["SpaceGrotesk-Medium"],
        bold: ["SpaceGrotesk-Bold"],
      },
    },
  },
  plugins: [],
};
