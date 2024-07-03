/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ["./views/**/*.pug"],
  theme: {
    extend: {
      colors: {
        customGray: '#E7EBE5',
        customGreen: '#516244',
        customLightGreen: '#758D63',
      },
    },
  },
  plugins: [
    
  ],
}

// npx tailwindcss -i ./public/stylesheets/baseTailwind.css -o ./public/stylesheets/outputTailwind.css --watch
