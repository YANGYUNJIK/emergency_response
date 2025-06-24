/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",   // 🔥 이 부분 꼭 필요함
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
