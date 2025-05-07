/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#3490dc', // Example primary color
        secondary: '#ffed4a', // Example secondary color
        accent: '#e3342f', // Example accent color
        customGray: '#f5f5f5', // Example custom gray color
      },
    },
  },
  plugins: [],
}
