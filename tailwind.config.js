/** @type {import('tailwindcss').Config} */
module.exports={
  content:['./app/**/*.{js,ts,jsx,tsx}','./components/**/*.{js,ts,jsx,tsx}'],
  theme:{extend:{
    colors:{
      navy:{50:'#eef2ff',100:'#e0e7ff',700:'#1e293b',800:'#0f172a',900:'#060912'},
      brand:{300:'#fdba74',400:'#fb923c',500:'#f97316',600:'#ea580c'}
    },
    boxShadow:{
      'glow-orange':'0 0 20px rgba(249,115,22,0.4)',
      'glow-navy':'0 0 20px rgba(79,70,229,0.35)',
      'glow-green':'0 0 20px rgba(16,185,129,0.35)',
      'glow-red':'0 0 20px rgba(239,68,68,0.3)',
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