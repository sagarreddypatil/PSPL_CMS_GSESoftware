/** @type {import('tailwindcss').Config} */
const Color = require("color");

let pspColors = {
  "night-sky": "#252526",
  rush: "#DAAA00",
  moondust: "#F2EFE9",
  "bm-gold": "#CFB991",
  aged: "#8E6F3E",
  field: "#DDB945",
  dust: "#EBD99F",
  steel: "#555960",
  "cool-gray": "#6F727B",
};

const lighten = (color, amount) => Color(color).lighten(amount).rgb().string();
const darken = (color, amount) => Color(color).darken(amount).rgb().string();

Object.keys(pspColors).forEach((color) => {
  pspColors[color] = {
    DEFAULT: pspColors[color],
    light: lighten(pspColors[color], 0.1),
    dark: darken(pspColors[color], 0.1),
  };
});

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ...pspColors,
      },
    },
  },
};
