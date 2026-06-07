/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // Enable dark mode support
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        secondary: "#6B7280",
        background: "#F9FAFB",
        surface: "#FFFFFF",
        surfaceVariant: "#F3F4F6",
        accent: "#10B981",
        border: "#E5E7EB",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
    },
  },
  plugins: [],
};
