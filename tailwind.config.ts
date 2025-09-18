import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Brand Colors
        'brand': {
          'deep-blue': 'hsl(214 100% 34%)',
          'light-gray': 'hsl(240 20% 97%)',
          'cyan': 'hsl(189 100% 44%)',
          'orange': 'hsl(32 100% 56%)',
        },
        // UI Colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(214 100% 34%)',
          foreground: 'hsl(0 0% 100%)',
          soft: 'hsl(214 100% 94%)',
        },
        secondary: {
          DEFAULT: 'hsl(240 20% 97%)',
          foreground: 'hsl(214 100% 34%)',
        },
        destructive: {
          DEFAULT: 'hsl(0 84% 60%)',
          foreground: 'hsl(0 0% 100%)',
        },
        muted: {
          DEFAULT: 'hsl(240 20% 97%)',
          foreground: 'hsl(215 16% 47%)',
        },
        accent: {
          DEFAULT: 'hsl(240 20% 97%)',
          foreground: 'hsl(214 100% 34%)',
          soft: 'hsl(240 20% 97%)',
        },
        warning: {
          DEFAULT: 'hsl(32 100% 56%)',
          foreground: 'hsl(0 0% 100%)',
          soft: 'hsl(32 100% 94%)',
        },
        popover: {
          DEFAULT: 'hsl(0 0% 100%)',
          foreground: 'hsl(224 71% 4%)',
        },
        card: {
          DEFAULT: 'hsl(0 0% 100%)',
          foreground: 'hsl(224 71% 4%)',
        },
        sidebar: {
          DEFAULT: 'hsl(0 0% 98%)',
          foreground: 'hsl(240 5.3% 26.1%)',
          primary: 'hsl(240 5.9% 10%)',
          'primary-foreground': 'hsl(0 0% 98%)',
          accent: 'hsl(240 4.8% 95.9%)',
          'accent-foreground': 'hsl(240 5.9% 10%)',
          border: 'hsl(220 13% 91%)',
          ring: 'hsl(217.2 91.2% 59.8%)',
        },
      },
      borderRadius: {
        lg: '0.75rem',
        md: 'calc(0.75rem - 2px)',
        sm: 'calc(0.75rem - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'card': '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
        'button': '0 4px 14px 0 rgba(33, 150, 243, 0.39)',
        'premium': '0 25px 50px -12px rgba(33, 150, 243, 0.25)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, hsl(214 100% 34%) 0%, hsl(189 100% 44%) 100%)',
        'gradient-premium': 'linear-gradient(135deg, hsl(214 100% 34%) 0%, hsl(32 100% 56%) 100%)',
        'gradient-card': 'linear-gradient(135deg, hsl(240 20% 97%) 0%, hsl(0 0% 100%) 100%)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
