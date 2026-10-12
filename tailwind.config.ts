import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './data/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.25rem',
        sm: '1.5rem',
        lg: '2.5rem',
        xl: '3rem',
      },
      screens: {
        '2xl': '1320px',
      },
    },
    extend: {
      colors: {
        orange: {
          DEFAULT: '#f47b49',
          50: '#fdf3ee',
          100: '#fbe3d8',
          400: '#f79671',
          500: '#f47b49',
          600: '#e2612c',
          700: '#bc4d21',
        },
        charcoal: {
          DEFAULT: '#2e2e2e',
          light: '#4a4a4a',
          muted: '#6b6b6b',
        },
        ink: '#1a1a1a',
        cream: '#f7f5f2',
        line: '#e6e2dc',
      },
      fontFamily: {
        serif: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.22em',
        widest2: '0.3em',
      },
      maxWidth: {
        /* 1320px up to laptop widths; wider screens and TVs use 90% of the
           window (up to 1760px) instead of leaving wide empty margins. */
        container: 'clamp(1320px, 90vw, 1760px)',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
      animation: {
        marquee: 'marquee 45s linear infinite',
        'marquee-slow': 'marquee 70s linear infinite',
        'pulse-ring': 'pulseRing 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
