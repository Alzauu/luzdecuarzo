import daisyui from 'daisyui';
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        salvia: '#8FA491',
        'salvia-oscuro': '#4A5A4C',
        niebla: '#D6D9D4',
        crema: '#F7F7F4',
        'verde-profundo': '#2E3A2F',
        'texto-suave': '#6E7A6F',
        'madera-clara': '#F7F1E6',
        'madera-borde': '#D8C7A8',
        'madera-texto': '#8A7455'
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', '"Times New Roman"', 'serif']
      }
    }
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        saunaYBruma: {
          primary: '#4A5A4C',
          'primary-content': '#F7F7F4',
          secondary: '#8FA491',
          'secondary-content': '#2E3A2F',
          accent: '#8FA491',
          neutral: '#2E3A2F',
          'neutral-content': '#F7F7F4',
          'base-100': '#F7F7F4',
          'base-200': '#D6D9D4',
          'base-300': '#C3C9C1',
          'base-content': '#2E3A2F',
          info: '#8FA491',
          success: '#5C8A5C',
          warning: '#C08033',
          error: '#B3554A',
          '--rounded-box': '1rem',
          '--rounded-btn': '2rem'
        }
      }
    ],
    darkTheme: 'saunaYBruma'
  }
} satisfies Config;