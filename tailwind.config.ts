import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg-canvas)",
        surface: "var(--bg-surface)",
        secondary: "var(--bg-secondary)",
        elevated: "var(--bg-elevated)",
        ink: {
          DEFAULT: "var(--text-primary)",
          muted: "var(--text-secondary)",
        },
        line: "var(--border-subtle)",
        accent: {
          DEFAULT: "#5865D8",
          hover: "#4956C7",
          subtle: "var(--accent-subtle)",
          border: "var(--accent-border)",
        },
        lavender: {
          DEFAULT: "#9185C7",
          subtle: "rgba(145, 133, 199, 0.12)",
        },
        green: {
          DEFAULT: "#72A88F",
          subtle: "rgba(114, 168, 143, 0.12)",
        },
        gold: {
          DEFAULT: "#C5A05A",
          subtle: "rgba(197, 160, 90, 0.12)",
        },
        coral: {
          DEFAULT: "#D8897D",
          subtle: "rgba(216, 137, 125, 0.12)",
        },
        // Backwards compatibility mappings for smooth migration
        nalanda: {
          canvas: "var(--bg-canvas)",
          surface: "var(--bg-surface)",
          subtle: "var(--bg-secondary)",
          ink: "var(--text-primary)",
          muted: "var(--text-secondary)",
          border: "var(--border-subtle)",
          indigo: {
            DEFAULT: "#5865D8",
            hover: "#4956C7",
            subtle: "var(--accent-subtle)",
            border: "var(--accent-border)",
          },
          saffron: {
            DEFAULT: "#C5A05A",
            hover: "#B38E4A",
            subtle: "rgba(197, 160, 90, 0.12)",
            border: "rgba(197, 160, 90, 0.25)",
          },
          success: {
            DEFAULT: "#72A88F",
            subtle: "rgba(114, 168, 143, 0.12)",
            border: "rgba(114, 168, 143, 0.25)",
          },
          warning: {
            DEFAULT: "#C5A05A",
            subtle: "rgba(197, 160, 90, 0.12)",
            border: "rgba(197, 160, 90, 0.25)",
          },
          error: {
            DEFAULT: "#D8897D",
            subtle: "rgba(216, 137, 125, 0.12)",
            border: "rgba(216, 137, 125, 0.25)",
          },
        },
      },
      borderRadius: {
        'control': '10px',
        'btn': '12px',
        'card': '16px',
        'hero': '20px',
      },
    },
  },
  plugins: [],
};
export default config;
