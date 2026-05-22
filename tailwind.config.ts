import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#4F46E5",
        },
        accent: {
          DEFAULT: "#10B981",
        },
        danger: {
          DEFAULT: "#F43F5E",
        },
        neutral: {
          DEFAULT: "#6B7280", // Using gray-500 as default neutral
        }
      },
    },
  },
  plugins: [],
};
export default config;
