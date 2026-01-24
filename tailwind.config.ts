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
        // Neobrutalism bold color palette
        'brutal-black': '#000000',
        'brutal-white': '#FFFFFF',
        'brutal-yellow': '#FFE500',
        'brutal-pink': '#FF006E',
        'brutal-cyan': '#00F5FF',
        'brutal-purple': '#8B5CF6',
        'brutal-green': '#00FF00',
        'brutal-orange': '#FF6B00',
        'brutal-red': '#FF0000',
        'brutal-blue': '#0066FF',
      },
      backgroundImage: {
        'gradient-brutal': 'linear-gradient(135deg, #FFE500 0%, #FF006E 50%, #00F5FF 100%)',
        'mesh-brutal': 'radial-gradient(at 20% 30%, #FFE500 0px, transparent 50%), radial-gradient(at 80% 20%, #FF006E 0px, transparent 50%), radial-gradient(at 40% 80%, #00F5FF 0px, transparent 50%)',
        'dots': 'radial-gradient(circle, #000 1px, transparent 1px)',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'tilt': 'tilt 3s ease-in-out infinite',
        'float-brutal': 'float-brutal 4s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 20s linear infinite',
        'pulse-brutal': 'pulse-brutal 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        tilt: {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        },
        'float-brutal': {
          '0%, 100%': { transform: 'translateY(0px) rotate(-2deg)' },
          '50%': { transform: 'translateY(-15px) rotate(2deg)' },
        },
        'rotate-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-brutal': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
      boxShadow: {
        'brutal': '8px 8px 0px 0px #000000',
        'brutal-lg': '12px 12px 0px 0px #000000',
        'brutal-xl': '16px 16px 0px 0px #000000',
        'brutal-color': '8px 8px 0px 0px #FF006E',
        'brutal-color-lg': '12px 12px 0px 0px #FF006E',
        'brutal-hover': '4px 4px 0px 0px #000000',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '5': '5px',
        '6': '6px',
      },
    },
  },
  plugins: [],
}

export default config
