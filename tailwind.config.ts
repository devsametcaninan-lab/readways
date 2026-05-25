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
      },
      animation: {
        marquee: "marquee 55s linear infinite",
        "toast-in": "toast-in 220ms ease-out forwards",
        "toast-out": "toast-out 180ms ease-in forwards",
        "check-pop": "check-pop 240ms ease-out forwards"
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        },
        "toast-out": {
          "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(6px) scale(0.98)" }
        },
        "check-pop": {
          "0%": { opacity: "0", transform: "scale(0.85)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
