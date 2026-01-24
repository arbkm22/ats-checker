import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk-inspired color palette
        'cyber-purple': '#B026FF',
        'cyber-pink': '#FF2E97',
        'cyber-blue': '#00D9FF',
        'cyber-green': '#39FF14',
        'cyber-yellow': '#FFD700',
        'neo-dark': '#0A0E27',
        'neo-darker': '#050812',
        'glass-white': 'rgba(255, 255, 255, 0.1)',
        'glass-border': 'rgba(255, 255, 255, 0.2)',
      },
      backgroundImage: {
        'gradient-cyber': 'linear-gradient(135deg, #B026FF 0%, #FF2E97 50%, #00D9FF 100%)',
        'gradient-score-low': 'linear-gradient(135deg, #FF2E97 0%, #FF6B6B 100%)',
        'gradient-score-mid': 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        'gradient-score-high': 'linear-gradient(135deg, #39FF14 0%, #00D9FF 100%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      backdropBlur: {
        'glass': '12px',
      },
    },
  },
  plugins: [],
}

export default config
