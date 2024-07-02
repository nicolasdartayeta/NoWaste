/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ["./views/**/*.pug"],
  theme: {
    extend: {
      colors: {
        customGray: '#E7EBE5', // Aquí puedes usar el color que desees
      },
    },
  },
  plugins: [
    
  ],
}

// npx tailwindcss -i ./public/stylesheets/baseTailwind.css -o ./public/stylesheets/outputTailwind.css --watch
