/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ["./views/**/*.pug"],
  theme: {
    extend: {},
  },
  plugins: [
    
  ],
}

// npx tailwindcss -i ./public/stylesheets/baseTailwind.css -o ./public/stylesheets/baseTailwind.css --watch
