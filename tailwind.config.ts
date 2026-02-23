import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        graphite: '#0f1623',
        frost: '#d8f1ff',
        neon: '#2bb6ff',
        cobalt: '#2b5fa8'
      },
      boxShadow: {
        glow: '0 0 24px rgba(43, 182, 255, 0.38)',
        glass: '0 24px 50px rgba(3, 10, 20, 0.5)'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(43, 182, 255, 0.28)' },
          '50%': { boxShadow: '0 0 26px rgba(43, 182, 255, 0.48)' }
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        pulseGlow: 'pulseGlow 2.2s ease-in-out infinite',
        riseIn: 'riseIn 320ms ease-out forwards'
      }
    }
  },
  plugins: []
};

export default config;
