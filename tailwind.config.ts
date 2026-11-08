import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0b0e14',
          soft: '#10141c',
          card: '#131823',
          elevated: '#1a2030',
          hover: '#1f2637',
        },
        line: {
          DEFAULT: '#232a3b',
          strong: '#2e3750',
        },
        ink: {
          DEFAULT: '#e6e9f0',
          muted: '#9aa3b8',
          faint: '#6b7489',
        },
        brand: {
          DEFAULT: '#3b82f6',
          soft: '#1e3a8a',
          glow: '#60a5fa',
        },
        up: {
          DEFAULT: '#22c55e',
          soft: 'rgba(34, 197, 94, 0.12)',
        },
        down: {
          DEFAULT: '#ef4444',
          soft: 'rgba(239, 68, 68, 0.12)',
        },
        gold: '#f5b942',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(59,130,246,0.4), 0 8px 30px -10px rgba(59,130,246,0.5)',
      },
      keyframes: {
        'flash-up': {
          '0%': { backgroundColor: 'rgba(34, 197, 94, 0.28)' },
          '100%': { backgroundColor: 'transparent' },
        },
        'flash-down': {
          '0%': { backgroundColor: 'rgba(239, 68, 68, 0.28)' },
          '100%': { backgroundColor: 'transparent' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pop': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '60%': { transform: 'scale(1.04)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'flash-up': 'flash-up 1.2s ease-out',
        'flash-down': 'flash-down 1.2s ease-out',
        'slide-in': 'slide-in 0.25s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        pop: 'pop 0.4s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
