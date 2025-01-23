/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        grotesk: ['var(--font-spacegrotesk)'],
        alegreya: ['var(--font-alegreya)'],
        satisfy: ['var(--font-satisfy)'],
        arial: ['var(--font-arial)'],
      },
    },
  },
};
