"use client";

import Image from "next/image";
import Link from "next/link";
import { SlBadge } from "react-icons/sl";
import chef from "../../../../assets/Ellipse 3.png";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Star,
  Bookmark,
  CheckCircle,
  Phone,
  Award,
} from "lucide-react";

export const chefProfileData = {
  name: "Ahmed Benjelloun",
  title: "Chef",
  location: "Casablanca",
  experience: "8 Years Of Experience",
  experienceRange: "5 To 10 Years",
  isVerified: true,
  profilePicture: chef,
  avatarInitial: "A",
  previousExperience: [
    {
      companyName: "Cafe rio",
      workingPeriod: "2 years",
      position: "Chef",
      date: "05/12/2024\n05/12/2026",
    },
    {
      companyName: "Cafe rio",
      workingPeriod: "2 years",
      position: "Chef",
      date: "05/12/2024\n05/12/2026",
    },
    {
      companyName: "Cafe rio",
      workingPeriod: "2 years",
      position: "Chef",
      date: "05/12/2024\n05/12/2026",
    },
    {
      companyName: "Cafe rio",
      workingPeriod: "2 years",
      position: "Chef",
      date: "05/12/2024\n05/12/2026",
    },
  ],
  culinarySpecialties: [
    "Mediterranean",
    "French",
    "Moroccan Traditional",
    "Moroccan Traditional",
  ],
  dishPhotos: [
    "https://i.ibb.co/HD6WMnhg/Rectangle-119.png",
    "https://i.ibb.co/HD6WMnhg/Rectangle-119.png",
    "https://i.ibb.co/9kBThpjC/Rectangle-118.png",
    "https://i.ibb.co/1Gfd7RtB/Rectangle-117.png",
    "https://i.ibb.co/j9Wwj0H0/Rectangle-116.png",
    "https://i.ibb.co/j9Wwj0H0/Rectangle-116.png",
  ],
  statistics: {
    profileViewed: "24 Times",
    memberSince: "January 2024",
    lastActivity: "(The Text Is Cut Off)",
  },
};

export default function ChefProfilePage() {
  const chef = chefProfileData;

  return (
    <div className="min-h-screen bg-[#f9fafa] px-4 py-8 md:px-8 font-poppins">
      <div className="max-w-7xl mx-auto">
        {/* <Link href="/jobProfile" className="flex items-center text-sm text-gray-600 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Chef Profile
        </Link> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Top Profile Card */}
            <div className="bg-white rounded-xl border p-6 flex flex-col md:flex-row gap-6 items-start">
              <div className="relative w-24 h-24 rounded-full ">
                <Image
                  src={chef.profilePicture}
                  alt="Chef"
                  width={96}
                  height={96}
                  className="rounded-full object-cover"
                />
                <div className="absolute bottom-1 right-1 bg-[#679046] p-1 rounded-full">
                  <Award className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-1 gap-2">
                  <h2 className="text-xl font-semibold text-gray-800 leading-tight">
                    {chef.name.split(" ")[0]} <br /> {chef.name.split(" ")[1]}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 text-sm text-gray-700">
                      <Bookmark className="w-4 h-4" /> Save
                    </button>
                    {chef.isVerified && (
                      <span className="flex items-center gap-1 text-sm px-2 py-1 bg-[#E4FCE9] text-[#3D5F49] rounded-md">
                        <SlBadge  className="w-4 h-4" /> Verified
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{chef.title}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {chef.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" /> {chef.experience}
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" /> {chef.experienceRange}
                  </div>
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Previous Experience</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chef.previousExperience.map((exp, idx) => (
                  <div key={idx} className="bg-[#F0F4EC] border border-[#679046] rounded-md p-3 text-sm">
            <div className="flex justify-between  items-center ">
                <div>
                            <p className="text-gray-800">
                      <span className="font-medium">Company Name :</span> {exp.companyName}
                    </p>
                    <p className="text-gray-800">
                      <span className="font-medium">Working Period :</span> {exp.workingPeriod}
                    </p>
                </div>
                <div>
     <p className="text-gray-800">
                      <span className="font-medium">Position :</span> {exp.position}
                    </p>
                    <p className="text-gray-800 whitespace-pre-line">
                      <span className="font-medium">Date :</span> {exp.date}
                    </p>
                </div>
            </div>
               
                  </div>
                ))}
              </div>
            </div>

            {/* Specialties */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Culinary Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {chef.culinarySpecialties.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-[#ffe8d0] text-[#e76f00] px-4 py-1 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

      
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact */}
            <div className="bg-white rounded-xl border p-6 text-center">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Contact:</h3>
              <div className="flex justify-center mb-4">
                <div className="bg-gray-100 rounded-full p-3">
                  <Phone className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Contact information is reserved for restaurants
              </p>
              <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 px-4 rounded-md">
                Access contacts
              </button>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Statistics Section:</h3>
              <div className="text-xs space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Profile Viewed:</span>
                  <span className="font-medium">{chef.statistics.profileViewed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Member Since:</span>
                  <span className="font-medium">{chef.statistics.memberSince}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last:</span>
                  <span className="font-medium">{chef.statistics.lastActivity}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
              {/* Dishes */}
            <div className="bg-white rounded-xl border p-6 mt-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">Photos of your dishes</h3>
              <p className="text-xs text-gray-600 mb-3">Current Photos:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {chef.dishPhotos.map((img, i) => (
                  <div key={i} className="aspect-[185/109] w-full relative rounded-md overflow-hidden">
                    <Image
                      src={img}
                      alt={`Dish ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
      </div>
    </div>
  );
}
