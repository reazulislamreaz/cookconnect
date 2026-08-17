"use client";

import { Users, ShieldCheck, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BestProfile() {
  return (
    <section className="bg-[#F0F4EC] py-10 px-4 font-poppins">
      <div className="max-w-5xl mx-auto text-center">

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-semibold text-[#5B913B] mb-2">
          Find The Best Profiles
        </h1>

        {/* Subtitle */}
        <p className="text-sm md:text-base text-[#5B913B] mb-6">
          Discover Verified And Experienced Professional Chefs
        </p>

        {/* Stats Row */}
        <div className="flex flex-wrap justify-center gap-6 text-[#5B913B] text-sm font-medium">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>25 Cooks</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Profiles</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>All Cities</span>
          </div>
        </div>
      </div>
    </section>
  );
}
