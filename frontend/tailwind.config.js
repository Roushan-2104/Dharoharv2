/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#08080C',
        'obsidian-surface': '#101017',
        'obsidian-card': '#161520',
        'temple-gold': '#D4AF37',
        'temple-gold-light': '#F5D77F',
        'saffron': '#F59E0B',
        'amber-glow': '#D97706',
        'peacock-teal': '#0D9488',
        'lapis-blue': '#3B82F6',
        'terracotta': '#C2410C',
        'lotus-rose': '#EC4899',
        'light-bg': '#F4F4F5',
        'zinc-accent': '#18181B',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        cinzel: ['Cinzel', 'serif'],
        'cinzel-dec': ['"Cinzel Decorative"', 'serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'gold-glow': '0 0 25px rgba(212, 175, 55, 0.25)',
        'gold-glow-lg': '0 0 50px rgba(212, 175, 55, 0.35)',
      },
      borderWidth: {
        '1.5': '1.5px',
      }
    },
  },
  plugins: [],
}
