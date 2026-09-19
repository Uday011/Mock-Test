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
        // Light mode tokens (default) matching ExamCraft North Star
        canvas: "#F7F6F3",
        surface: "#FFFFFF",
        secondary: "#F0EFEA",
        elevated: "#FFFFFF",
        line: "#E8E6E1",
        ink: {
          DEFAULT: "#18181B",
          muted: "#71717A",
        },
        accent: {
          DEFAULT: "#2E7D62",
          hover: "#266A53",
          subtle: "#EBF5F0",
        },
        lavender: "#6E62E5",
        green: "#2E7D62",
        gold: "#E07A2B",
        coral: "#DC4C40",

        // Legacy compatibility — map old nalanda tokens to new values
        nalanda: {
          canvas: "#F7F7F5",
          surface: "#FFFFFF",
          subtle: "#F3F3F1",
          ink: "#161616",
          muted: "#6B6B6B",
          border: "#E5E5E2",
          indigo: {
            DEFAULT: "#5865D8",
            hover: "#4956C7",
            subtle: "#ECEEFF",
            border: "#C5C9F4",
          },
          saffron: {
            DEFAULT: "#C5A05A",
            hover: "#B38E4A",
            subtle: "#FDF6EC",
            border: "#F6E3C7",
          },
          success: {
            DEFAULT: "#72A88F",
            subtle: "#EDF7ED",
            border: "#C8E6C9",
          },
          warning: {
            DEFAULT: "#C5A05A",
            subtle: "#FFFBEB",
            border: "#FEF3C7",
          },
          error: {
            DEFAULT: "#D8897D",
            subtle: "#FEF2F2",
            border: "#FEE2E2",
          },
        },
        notion: {
          canvas: "#FFFFFF",
          page: "#F7F7F5",
          sidebar: "#F1F1EF",
          hover: "#EAEAE7",
          border: "#E6E6E3",
          ink: "#202124",
          muted: "#787774",
        },
      },
      borderRadius: {
        control: "10px",
        btn: "12px",
        card: "16px",
        hero: "20px",
      },
    },
  },
  plugins: [],
};
export default config;
