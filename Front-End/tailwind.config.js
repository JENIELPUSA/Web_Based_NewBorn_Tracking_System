/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
         extend: {
      screens: {
        // Super small phones
        '2xs': '320px',

        // Most common phones (lower bound)
        'xs': '360px',

        // Common phones (upper bound)
        'xs-max': '430px',

        //Slightly bigger devices
        'xm': '480px',
      },
      colors: {
        'custom-blue': '#00509d', // Define your custom color
        'custom-yellow': '#fdc500',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      }
    },
    },
    plugins: [],
};
