/** @type {import('tailwindcss').Config} */
import { COLORS } from "./src/data/colors";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "sowma-lightest-blue": COLORS.SOWMA_LIGHTEST_BLUE,
        "sowma-lighter-blue": COLORS.SOWMA_LIGHTER_BLUE,
        "sowma-light-blue": COLORS.SOWMA_LIGHT_BLUE,
        "sowma-blue": COLORS.SOWMA_BLUE,
        "sowma-dark-blue": COLORS.SOWMA_DARK_BLUE,
        "sowma-light-green": COLORS.SOWMA_LIGHT_GREEN,
        "sowma-green": COLORS.SOWMA_GREEN,
        "sowma-dark-green": COLORS.SOWMA_DARK_GREEN,
        "sowma-bright-green": COLORS.SOWMA_BRIGHT_GREEN,
        "sowma-bright-red": COLORS.SOWMA_BRIGHT_RED,
        "sowma-gray": COLORS.SOWMA_GRAY,
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
