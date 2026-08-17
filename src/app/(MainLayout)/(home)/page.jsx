"use client";

// Home page composition follows Change Requirements section 03 + 04 ordering:
//
//   1. main banner image (admin-replaceable background — ClientDoc 7)
//   2. split-screen hero, placed exactly where the stats row used to sit
//   3. advertising banner #1, middle of the page, auto-rotating
//   4. step-by-step "how it works", replacing "What Makes Us Different"
//   5. the three icons: chef, restaurant, document + green validation badge
//   6. stats, with "People who successfully found a job"
//   7. offer preview — guests see page one only, each card with its own Sign Up
//   8. advertising banner #2, bottom of the page

import Banner from "@/app/component/home/Banner";
import SplitHero from "@/app/component/home/SplitHero";
import HowItWorks from "@/app/component/home/HowItWorks";
import Highlights from "@/app/component/home/Highlights";
import Stats from "@/app/component/home/Stats";
import GuestOffers from "@/app/component/home/GuestOffers";
import FeedbackWidget from "@/app/component/home/FeedbackWidget";
import AdCarousel from "@/app/component/ui/AdCarousel";
import { HOME_BANNERS_MIDDLE, HOME_BANNERS_BOTTOM } from "@/mock/banners";

export default function HomePage() {
  return (
    <>
      <Banner />
      <SplitHero />
      <AdCarousel slides={HOME_BANNERS_MIDDLE} className="py-10" />
      <HowItWorks />
      <Highlights />
      <Stats />
      <GuestOffers />
      <AdCarousel slides={HOME_BANNERS_BOTTOM} className="py-10" />
      <FeedbackWidget />
    </>
  );
}
