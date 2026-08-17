import { DM_Sans, Urbanist, Inter, Poppins } from "next/font/google";
import "../app/globals.css";

import Providers from "../Provider/Providers";

// Import fonts
const dmSans = DM_Sans({ weight: ["300", "400", "500", "700"], subsets: ["latin"], variable: "--font-dm-sans" });
const urbanist = Urbanist({ weight: ["300", "400", "500", "700"], subsets: ["latin"], variable: "--font-urbanist" });
const inter = Inter({ weight: ["300", "400", "500", "700"], subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Nkhedmou.ma — Emploi restauration & hôtellerie au Maroc",
  description:
    "Nkhedmou.ma met en relation cuisiniers, boulangers et personnel d'hôtel avec les restaurants, hôtels et boulangeries qui recrutent au Maroc.",
};

export default function RootLayout({ children }) {
  // `lang` / `dir` start on the French default and are updated on the client by
  // LocaleProvider when the visitor switches to Darija.
  return (
    <html lang="fr" dir="ltr">
      <body
        className={`${dmSans.variable} ${urbanist.variable} ${poppins.variable} ${inter.variable} antialiased bg-white`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
