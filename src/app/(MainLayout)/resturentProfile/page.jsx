"use client";

import Image from "next/image";
import {
  ArrowLeft,
  BadgeCheck,
  Facebook,
  Pencil,
  Phone,
  Briefcase,
} from "lucide-react";

import cover from "../../../assets/cover.png";
import profile from "../../../assets/profile.png";
import { FaEdit, FaFacebook } from "react-icons/fa";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-poppins">
      <div className="max-w-6xl mx-auto">
        {/* Top Back Nav */}
        <Link href={'/resturentDashboard'}>
        <div className="flex items-center mb-4">
          <ArrowLeft className="w-5 h-5 text-gray-600 mr-2" />
          <span className="text-sm text-gray-600 font-medium">Profile</span>
        </div>
        </Link>

        {/* Profile Header */}
     <div className="relative w-full  mx-auto   overflow-hidden">
      {/* Cover Photo */}
      <div className="relative w-full h-40 sm:h-48 md:h-56 rounded-lg ">
        <Image
          src={cover}
          alt="Cover Photo"
          fill
          className="object-cover w-full h-full"
        />
      </div>

      {/* Profile Info Section */}
      <div className="flex items-center justify-between ">
<div className="flex items-center px-1 sm:px-6 md:px-8 pb-6 pt-4 relative z-10">
            {/* Profile Image with Verified Badge */}
        <div className="relative -mt-12 sm:-mt-16">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4  ">
            <Image
              src={profile}
              alt="Profile"
              fill
              className="object-cover rounded-full"
            />
          </div>

          {/* Verified Badge */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-green-100 text-green-800 px-3 py-0.5 rounded-full flex items-center gap-1 text-xs shadow-sm border border-green-200">
            <BadgeCheck className="w-4 h-4" />
            Veryfied
          </div>
        </div>

        {/* Name and Social */}
        <div className="ml-4 sm:ml-6 mt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            The Cafe Rio
          </h2>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <FaFacebook className="w-4 h-4 text-blue-600 mr-1" />
            Facebook
          </div>
        </div>
</div>
<div >
    <Link href={'/editOwnerProfile'}>
    <button className="text-[#305DEC] flex items-center justify-center font-bold gap-1">Edit Profile <FaEdit className="text-[#305DEC] w-8"/></button>
    </Link>
</div>
      </div>
    </div>

        {/* Info Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-16">
          {/* Restaurant Info */}
          <div className="bg-white rounded-lg shadow-sm p-4 text-sm">
            <h3 className="text-green-600 font-semibold mb-3">
              Restaurant Information
            </h3>
            <div className="space-y-2 text-gray-700">
              <div className="flex gap-3">
                <span className="font-medium w-28">City:</span>
                <span>Kansas City, KS</span>
              </div>
              <div className="flex gap-3">
                <span className="font-medium w-28">Address:</span>
                <span>Suite 756 031 Ines Riverway</span>
              </div>
              <div className="flex gap-3">
                <span className="font-medium w-28">Business Email:</span>
                <span>Willie.Jennings@Example.Com</span>
              </div>
              <div className="flex gap-3">
                <span className="font-medium w-28">Phone Number:</span>
                <span>(+33)7 45 55 87 71</span>
              </div>
              <div className="flex gap-3">
                <span className="font-medium w-28">Busineses Type:</span>
                <span>Casablanca</span>
              </div>
            </div>
          </div>

          {/* Contact Box */}
          <div className="bg-white rounded-lg shadow-sm p-4 ">
              <h3 className="text-green-600 font-semibold mb-3 text-start">
             Contact
            </h3>
      <div className="flex flex-col items-center text-center">
              <Phone className="w-8 h-8 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-3">
              Contact info reserved for restaurants
            </p>
            <button className="bg-orange-500 text-white text-sm px-4 py-2 rounded-md hover:bg-orange-600 transition">
              Access contacts
            </button>
      </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-4 text-sm">
            <h3 className="text-green-600 font-semibold mb-3">
              Statistics Section
            </h3>
            <div className="space-y-2 text-gray-700">
              <div className="flex">
                <span className="font-medium w-28">Viewed:</span>
                <span>24 Times</span>
              </div>
              <div className="flex">
                <span className="font-medium w-28">Since:</span>
                <span>January 2024</span>
              </div>
              <div className="flex">
                <span className="font-medium w-28">Total Chefs:</span>
                <span>24</span>
              </div>
            </div>
          </div>
        </div>

{/* Recent Jobs */}
<div className="bg-white rounded-lg shadow-sm p-4 mt-8">
  <div className="flex items-center mb-4">
    <Briefcase className="w-5 h-5 text-gray-700 mr-2" />
    <h3 className="text-base font-semibold text-gray-800">
      My Recent Published Jobs
    </h3>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
      >
        {/* Top: Title + View */}
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm font-semibold text-gray-800">
            Chef specializing in Moroccan cuisine
          </p>
          <button className="bg-blue-100 text-blue-600 text-sm px-4 py-1 rounded-full font-medium hover:bg-blue-200 transition">
            View
          </button>
        </div>

        {/* Company */}
        <p className="text-sm text-gray-500">The King&apos;s Table</p>

        {/* Applied Count */}
        <p className="text-sm text-gray-600 mt-1">Total Applied 02</p>

        {/* Deadline */}
        <p className="text-sm text-orange-500 font-medium mt-1">
          Deadline : 06-28-205
        </p>
      </div>
    ))}
  </div>
</div>

      </div>
    </div>
  );
}
