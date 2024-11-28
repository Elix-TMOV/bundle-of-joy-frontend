/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ["primary-orange"]: "#ffbd84",
        ["primary-red"]: "#ff8489",
        ["primary-yellow"]: "#fffb84",
        ['primary-blue']: "#84c6ff",
        ['primary-green']: "#88ff84",
        ["secondary-blue"]: "#b7ddff",
        ["player-blue"]: "#8495ff",
      },
    },
  },
  plugins: [],
}

