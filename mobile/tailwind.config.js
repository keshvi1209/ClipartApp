/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0F",
        surface: "#13131A",
        border: "#1E1E2A",
        accent: "#7C3AED",
        "accent-light": "#A78BFA",
        muted: "#6B7280",
        text: "#F1F0FF",
        "text-dim": "#9CA3AF",
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
