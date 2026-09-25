/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#08090D',
        panel: '#101218',
        panel2: '#161923',
        edge: '#242836',
        volt: '#C6FF3D',
        volt2: '#9BE800',
        cyan: '#4CE3F7',
        magenta: '#FF4FD8',
        warn: '#FFB020',
        danger: '#FF5470',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        volt: '0 0 0 1px rgba(198,255,61,0.35), 0 0 40px -10px rgba(198,255,61,0.45)',
        glass: '0 8px 32px rgba(0,0,0,0.45)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '36px 36px',
      },
    },
  },
  plugins: [],
}
