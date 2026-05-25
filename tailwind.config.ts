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
          DEFAULT: "#00F3FF", // Neon Cyan
        },
        accent: {
          DEFAULT: "#FF00FF", // Neon Magenta
        },
        danger: {
          DEFAULT: "#FF3366", // Cyber Red
        },
        neutral: {
          DEFAULT: "#94A3B8",
        }
      },
    },
  },
  plugins: [],
};
export default config;
