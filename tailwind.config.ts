import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional Navy Palette
        navy: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d4ff',
          300: '#a5b8ff',
          400: '#8192ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Sophisticated Slate Palette
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Brand Colors
        primary: '#4f46e5',
        'primary-dark': '#4338ca',
        'primary-light': '#6366f1',
        secondary: '#475569',
        background: '#020617',
        surface: '#0f172a',
        'surface-light': '#1e293b',
        'text-primary': '#f8fafc',
        'text-secondary': '#cbd5e1',
        'text-muted': '#94a3b8',
        border: '#334155',
        'border-light': '#475569',
        // Accent colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#6366f1',
      },
      fontFamily: {
        sans: ["Inter", "var(--font-geist-sans)", "-apple-system", "BlinkMacSystemFont", "Arial", "Helvetica", "sans-serif"],
        mono: ["var(--font-geist-mono)", "Monaco", "Consolas", "monospace"],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        'gradient-surface': 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
        'gradient-trust': 'linear-gradient(135deg, #4f46e5 0%, #334155 50%, #1e293b 100%)',
        'gradient-glossy': 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
      },
      boxShadow: {
        'professional': '0 20px 25px -5px rgba(15, 23, 42, 0.3), 0 10px 10px -5px rgba(99, 102, 241, 0.05)',
        'glossy': '0 8px 32px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(248, 250, 252, 0.1)',
        'trust': '0 25px 50px -12px rgba(79, 70, 229, 0.3), 0 10px 10px -5px rgba(15, 23, 42, 0.1)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '8px',
        'professional': '20px',
        'xl': '40px',
      },
    },
  },
  plugins: [
    function({ addUtilities }: any) {
      addUtilities({
        '.scrollbar-thin': {
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#475569', // slate-600
            borderRadius: '3px',
            border: '1px solid #334155', // slate-700
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#64748b', // slate-500
          },
        },
        '.scrollbar-thumb-slate-600': {
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#475569',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#64748b',
          },
        },
        '.scrollbar-track-slate-800': {
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#1e293b',
          },
        },
        '.scrollbar-thumb-navy-600': {
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#4f46e5',
            border: '1px solid #4338ca',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#6366f1',
          },
        },
        // Glass effects
        '.glass-overlay': {
          backgroundColor: 'rgba(248, 250, 252, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(203, 213, 225, 0.1)',
        },
        '.glass-overlay-strong': {
          backgroundColor: 'rgba(248, 250, 252, 0.1)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(203, 213, 225, 0.2)',
        },
        '.glass-navy': {
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
        },
      });
    },
  ],
};

export default config; 