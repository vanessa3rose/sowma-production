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
        "sowma-medium-blue": COLORS.SOWMA_MEDIUM_BLUE,
        "sowma-dark-blue": COLORS.SOWMA_DARK_BLUE,
        "sowma-darker-blue": COLORS.SOWMA_DARKER_BLUE,
        "sowma-darkest-blue": COLORS.SOWMA_DARKEST_BLUE,

        "sowma-light-green": COLORS.SOWMA_LIGHT_GREEN,
        "sowma-green": COLORS.SOWMA_GREEN,
        "sowma-dark-green": COLORS.SOWMA_DARK_GREEN,

        "sowma-bright-green": COLORS.SOWMA_BRIGHT_GREEN,
        "sowma-bright-red": COLORS.SOWMA_BRIGHT_RED,

        "sowma-lightest-gray": COLORS.SOWMA_LIGHTEST_GRAY,
        "sowma-lighter-gray": COLORS.SOWMA_LIGHTER_GRAY,
        "sowma-light-gray": COLORS.SOWMA_LIGHT_GRAY,
        "sowma-gray": COLORS.SOWMA_GRAY,
        "sowma-medium-gray": COLORS.SOWMA_MEDIUM_GRAY,
        "sowma-dark-gray": COLORS.SOWMA_DARK_GRAY,
        "sowma-darker-gray": COLORS.SOWMA_DARKER_GRAY,

        "sowma-light-red": COLORS.SOWMA_LIGHT_RED,
        "sowma-red": COLORS.SOWMA_RED,

        "sowma-instagram": COLORS.SOWMA_INSTAGRAM,
        "sowma-facebook": COLORS.SOWMA_FACEBOOK,
        "sowma-twitter": COLORS.SOWMA_TWITTER,
        "sowma-google-analytics": COLORS.SOWMA_GOOGLE_ANALYTICS,
        "sowma-constant-contact": COLORS.SOWMA_CONSTANT_CONTACT,
        "sowma-linkedin": COLORS.SOWMA_LINKEDIN,
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
