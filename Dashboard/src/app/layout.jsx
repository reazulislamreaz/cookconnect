import { Inter, Poppins } from "next/font/google";

import "./globals.css";
import Providers from "@/components/Providers";

// Poppins is the dashboard's type, matching the Figma; Inter backs the dense
// table numerals. Only the two the design actually uses are loaded — the public
// site ships four, and every extra family is another blocking font fetch.
const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "CookconneKt — Administration",
  description:
    "Tableau de bord d'administration CookconneKt : cuisiniers, restaurants, offres d'emploi et modération.",
};

export default function RootLayout({ children }) {
  // `lang` / `dir` start on the French default and are updated on the client by
  // LocaleProvider when the admin switches to Darija — hence
  // suppressHydrationWarning on <html>. On <body> it absorbs the attributes
  // browser extensions inject before React hydrates.
  //
  // `translate="no"` is deliberate: the app ships its own FR/AR/EN switcher, and
  // Chrome's auto-translate rewrites text nodes underneath React, which throws
  // "Failed to execute 'removeChild' on 'Node'" and takes the page down.
  return (
    <html lang="fr" dir="ltr" translate="no" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body
        suppressHydrationWarning
        className={`notranslate ${poppins.variable} ${inter.variable} bg-white antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
