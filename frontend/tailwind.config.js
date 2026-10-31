/** @type {import('tailwindcss').Config} */
// Colours and faces come from the tokens in src/index.css (Hallmark Grid theme).
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: 'var(--color-paper)',
        'paper-2': 'var(--color-paper-2)',
        'paper-3': 'var(--color-paper-3)',
        ink: 'var(--color-ink)',
        'ink-2': 'var(--color-ink-2)',
        muted: 'var(--color-muted)',
        rule: 'var(--color-rule)',
        field: 'var(--color-field)',
        'field-ink': 'var(--color-field-ink)',
        space: 'var(--color-space)',
        mark: 'var(--color-mark)',
        'mark-ink': 'var(--color-mark-ink)',
        focus: 'var(--color-focus)',
      },
      fontFamily: {
        sans: ['var(--font-body)'],
        display: ['var(--font-display)'],
        cinzel: ['var(--font-display)'],
      },
      letterSpacing: {
        display: 'var(--tracking-display)',
        poster: '-0.045em',
      },
      transitionDuration: {
        short: '160ms',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      spacing: {
        nav: 'var(--nav-height)',
      },
    },
  },
  plugins: [],
}
