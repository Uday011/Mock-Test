import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nalanda: {
          // Nalanda Core Visual Identity Tokens
          canvas: '#F7F7F5',       // Primary background (Warm ivory)
          surface: '#FFFFFF',      // Surface (White)
          subtle: '#F1F1EF',       // Secondary surface (Soft gray)
          ink: '#202124',          // Primary text (Charcoal)
          muted: '#787774',        // Secondary text (Muted gray)
          border: '#E6E6E3',       // Border (Light gray)
          indigo: {
            DEFAULT: '#4F46A5',    // Primary accent (Deep indigo)
            hover: '#433B91',
            subtle: '#EEF0FB',
            border: '#DCDDF7',
          },
          saffron: {
            DEFAULT: '#B7791F',    // Secondary accent (Muted saffron)
            hover: '#9E6719',
            subtle: '#FDF6EC',
            border: '#F6E3C7',
          },
          success: {
            DEFAULT: '#1B5E20',    // Soft green
            subtle: '#EDF7ED',
            border: '#C8E6C9',
          },
          warning: {
            DEFAULT: '#B7791F',    // Muted amber
            subtle: '#FFFBEB',
            border: '#FEF3C7',
          },
          error: {
            DEFAULT: '#C53030',    // Restrained red
            subtle: '#FEF2F2',
            border: '#FEE2E2',
          },
        },
        notion: {
          canvas: '#FFFFFF',
          page: '#F7F7F5',
          sidebar: '#F1F1EF',
          hover: '#EAEAE7',
          border: '#E6E6E3',
          ink: '#202124',
          muted: '#787774',
        },
      },
    },
  },
  plugins: [],
};
export default config;
