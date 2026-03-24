import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        bg: '#0D0F12',
        surface: '#151820',
        'surface-hover': '#1A1F2E',
        border: '#1E2330',
        'border-hover': '#2A3245',
        accent: '#2DD4BF',
        'accent-dim': 'rgba(45, 212, 191, 0.12)',
        amber: '#F59E0B',
        'amber-dim': 'rgba(245, 158, 11, 0.12)',
        danger: '#EF4444',
        'danger-dim': 'rgba(239, 68, 68, 0.12)',
        success: '#22C55E',
        'success-dim': 'rgba(34, 197, 94, 0.12)',
        text: '#F1F5F9',
        'text-muted': '#64748B',
        'text-faint': '#334155',

        /* shadcn mapping compatibility */
        background: '#0D0F12',
        foreground: '#F1F5F9',
        card: {
          DEFAULT: '#151820',
          foreground: '#F1F5F9',
        },
        popover: {
          DEFAULT: '#151820',
          foreground: '#F1F5F9',
        },
        primary: {
          DEFAULT: '#2DD4BF',
          foreground: '#0D0F12',
        },
        secondary: {
          DEFAULT: '#1A1F2E',
          foreground: '#F1F5F9',
        },
        muted: {
          DEFAULT: '#1A1F2E',
          foreground: '#64748B',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#F1F5F9',
        },
        ring: '#2DD4BF',
        input: '#1E2330',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow": "pulse-slow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
