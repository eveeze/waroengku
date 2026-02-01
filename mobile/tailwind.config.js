/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Minimalist Futuristic Palette
        background: '#FFFFFF', // Pure White
        foreground: '#09090b', // Deep Black

        primary: {
          DEFAULT: '#18181b', // Zinc-950
          foreground: '#fafafa', // Zinc-50
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        accent: {
          DEFAULT: '#7c3aed', // Violet-600 (Sharp Contrast)
          foreground: '#ffffff',
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        secondary: {
          DEFAULT: '#f4f4f5', // Zinc-100
          foreground: '#18181b', // Zinc-900
          50: '#f4f4f5', // Mapped for backward compatibility
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        success: {
          DEFAULT: '#10b981', // Emerald-500
          50: '#ecfdf5',
          500: '#10b981',
          700: '#047857',
        },
        warning: {
          DEFAULT: '#f59e0b', // Amber-500
          50: '#fffbeb',
          500: '#f59e0b',
          700: '#b45309',
        },
        danger: {
          DEFAULT: '#ef4444', // Red-500
          50: '#fef2f2',
          500: '#ef4444',
          700: '#b91c1c',
        },
        border: '#e4e4e7', // Zinc-200
        input: '#e4e4e7',
        ring: '#18181b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
