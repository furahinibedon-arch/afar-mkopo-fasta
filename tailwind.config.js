/** @type {import('tailwindcss').Config} */
module.exports={
  content:['./app/**/*.{js,ts,jsx,tsx}','./components/**/*.{js,ts,jsx,tsx}'],
  theme:{extend:{
    colors:{
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
      },
      brand: {
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#f97316',
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12',
      },
      dark: {
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
      }
    },
    boxShadow:{
      'glow-primary':'0 0 20px rgba(14,165,233,0.35)',
      'glow-brand':'0 0 20px rgba(249,115,22,0.4)',
      'card':'0 4px 24px rgba(15,23,42,0.08)',
      'card-hover':'0 8px 40px rgba(15,23,42,0.16)'
    },
    animation:{'fade-in':'fadeIn 0.4s ease-out','slide-up':'slideUp 0.45s ease-out'},
    keyframes:{
      fadeIn:{from:{opacity:'0'},to:{opacity:'1'}},
      slideUp:{from:{opacity:'0',transform:'translateY(16px)'},to:{opacity:'1',transform:'translateY(0)'}}
    }
  }},
  plugins:[]
};