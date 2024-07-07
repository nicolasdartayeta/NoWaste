/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ["./views/**/*.pug"],
  theme: {
    extend: {
      colors: {
        customGray: '#E7EBE5',
        customGreen: '#516244',
        customSimilar4: '#c3d5ca',
        customGreenSoft3: '#b0c6b5',
      },
      innerShadow: {
        '3xl': '35px 35px 60px -15px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [
    
  ],
}

// npx tailwindcss -i ./public/stylesheets/baseTailwind.css -o ./public/stylesheets/outputTailwind.css --watch
