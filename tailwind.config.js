/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      backgroundImage: {

          backgroundsize: "cover" ,
           backgroundposition: "center" ,
          backgroundrepeat: "no-repeat" 

      },
      fontFamily:{
        heading:["Roboto Condensed", "sans-serif"],
        chattext:["Roboto Condensed", "sans-serif"]
      },

      keyframes: {
        typing: {
          "0%": {
            width: "0%",
            visibility: "hidden"
          },
          "100%": {
            width: "100%"
          }  
        },
        blink: {
          "50%": {
            borderColor: "transparent"
          },
          "100%": {
            borderColor: "white"
          }  
        }
      },
      animation: {
        typing: "typing 2s steps(20, end) forwards, blink .7s infinite"
      }
    },
  },
  plugins: [],
}