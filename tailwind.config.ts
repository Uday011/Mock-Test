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
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        nalanda: {
          canvas: '#fcfbf9',
          surface: '#ffffff',
          subtle: '#f6f5f0',
          border: '#e7e5e0',
          'border-dark': '#d3cfc7',
          ink: '#0f172a',
          'ink-secondary': '#334155',
          muted: '#64748b',
          saffron: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
          },
          navy: {
            50: '#eff6ff',
            100: '#dbeafe',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e3a8a',
            900: '#0f172a',
          },
          emerald: {
            50: '#ecfdf5',
            600: '#059669',
            700: '#047857',
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
