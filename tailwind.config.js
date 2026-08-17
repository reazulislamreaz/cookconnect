/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Nkhedmou.ma brand palette
        brand: {
          DEFAULT: "#679046", // primary green
          dark: "#4F6F35",
          light: "#8FAF74",
          tint: "#E8EFE3", // hero / section wash
          soft: "#F0F4EC", // icon chip background
          mint: "#D9F9E6", // employer icon chip
        },
        accent: {
          DEFAULT: "#E87B35", // primary orange (CTA)
          dark: "#D2691E",
          light: "#F5A66E",
          tint: "#FDF1E7",
        },
      },
      fontFamily: {
        dm: ["var(--font-dm-sans)", "sans-serif"],
        urban: ["var(--font-urbanist)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        poppins: ["var(--font-poppins)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
