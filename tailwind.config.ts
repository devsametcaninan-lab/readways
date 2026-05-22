import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "#0A0B10",
        card: "#12141D",
        border: "#232737",
        accent: "#7C8CFF",
        accentSoft: "#9FA9FF"
      },
      boxShadow: {
        premium: "0 20px 60px rgba(124, 140, 255, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
