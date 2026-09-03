/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // CookconneKt palette, kept identical to the public site so the two
        // apps read as one product.
        brand: {
          DEFAULT: "#679046", // sidebar active state, primary green
          dark: "#4F6F35",
          light: "#8FAF74",
          tint: "#E8EFE3",
          soft: "#F0F4EC",
          mint: "#D9F9E6",
        },
        accent: {
          DEFAULT: "#E87B35", // logo / CTA orange
          dark: "#D2691E",
          light: "#F5A66E",
          tint: "#FDF1E7",
        },
        // Chart series colours, from the Figma dashboard.
        chart: {
          cook: "#8B8BE8",
          restaurant: "#F08A82",
        },
      },
      fontFamily: {
        poppins: ["var(--font-poppins)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
