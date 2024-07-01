/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ["./views/**/*.pug"],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

