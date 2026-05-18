import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#000000',
        surface: '#0a0a0f',
        card: '#0f0a14',
        neon: {
          DEFAULT: '#a855f7',
          bright: '#c084fc',
          dim: '#7c3aed',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(168, 85, 247, 0.35)',
        'glow-sm': '0 0 12px rgba(168, 85, 247, 0.25)',
        innerGlow: 'inset 0 0 0 1px rgba(168, 85, 247, 0.35)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 8px rgba(168,85,247,0.6))' },
          '50%': { opacity: '0.85', filter: 'drop-shadow(0 0 16px rgba(168,85,247,0.9))' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite',
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        spinSlow: 'spinSlow 1.1s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
