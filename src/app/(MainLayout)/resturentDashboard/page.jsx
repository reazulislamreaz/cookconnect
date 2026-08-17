"use client"

import DashboardCard from "../../component/dashboard/DashboardCard"
import { Users, Eye, Lock, User, Pencil, Bookmark, Briefcase, BadgeCheck, Award } from "lucide-react"
import { dashboardStats } from "../dashboard/page"
import Link from "next/link";

export default function Dashboard() {
    const jobs = [
  {
    company: "The King's Table",
    deadline: "06-28-205",
  },
  {
    company: "The King's Table",
    deadline: "06-28-205",
  },
  {
    company: "The King's Table",
    deadline: "06-28-205",
  },
  {
    company: "The King's Table",
    deadline: "06-28-205",
  },
  {
    company: "The King's Table",
    deadline: "06-28-205",
  },
];
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 lg:p-12 font-poppins">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Hello ahmed benjelloun.com!</h1>
          <p className="text-gray-600">Manage your profile and track your applications</p>
        </div>

        {/* Stats Cards */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {dashboardStats.map((stat) => (
            <DashboardCard
              key={stat.id}
              icon={stat.icon}
              percentage={stat.percentage}
              label={stat.label}
              iconColor={stat.iconColor}
              bgColor={stat.bgColor}
            />
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - My Profile */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6 h-fit">
            <div className="flex items-center mb-6">
              <User className="w-6 h-6 text-gray-700 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">My Profile</h3>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Complete Profile</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: "85%" }}></div>
              </div>
              <div className="flex items-center text-green-600 text-sm">
                <BadgeCheck className="w-4 h-4 mr-1" />
                <span>Verified Profile</span>
              </div>
            </div>

            <div className="space-y-3">
                <Link href={'/resturentProfile'}>
              <button className="w-full flex items-center justify-center py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Pencil className="w-4 h-4 mr-2" />
                Edit my profiles
              </button>
                </Link>
              {/* <button className="w-full flex items-center justify-center py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Eye className="w-4 h-4 mr-2" />
                View my public profile
              </button> */}
         <div>
                       <Link href={'/saveProfile'}>
              <button className="w-full flex items-center justify-center py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Bookmark className="w-4 h-4 mr-2" />
                View Saved profile
              </button>
                    </Link>
         </div>
            </div>
          </div>

          {/* Right Section - Job Listings */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Recent Published Jobs */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6 ">
                <Briefcase className="w-6 h-6 text-gray-700 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">My Recent Published Jobs</h3>
              </div>
              <div className="space-y-4">
                {/* Job Item 1 */}
               <div className="border rounded-lg p-4 w-full max-w-xl flex flex-col gap-2 shadow-sm">
      {/* Top Row: Title + View Button */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Chef specializing in Moroccan cuisine
          </p>
          <p className="text-sm text-gray-500 mt-1">The King&apos;s Table</p>
        </div>
               <Link href={'/jobDetails'}>
        <button className="bg-blue-100 text-blue-600 text-sm px-4 py-1 rounded-full font-medium">
          View
        </button>
               </Link>
      </div>

      {/* Middle Row: Applied Count */}
      <div>
        <Link href="/totalJobPost">
        <span className="inline-block bg-orange-500 text-white text-sm px-3 py-1 rounded-md font-medium">
          Total Applied 02
        </span>
        </Link>
      </div>

      {/* Bottom Row: Deadline */}
      <p className="text-sm text-orange-600 font-medium">
        Deadline : 06-28-205
      </p>
    </div>
          
              </div>
            </div>

            {/* Total Job Posted */}
            <div className="bg-white rounded-lg shadow-sm p-6">
         <p className="text-sm font-semibold text-gray-800 mb-4">
        Total Job Posted : {jobs.length.toString().padStart(2, "0")}
      </p>

              <div className="space-y- ">
                {/* Job Item 1 */}
    <div className="border rounded-lg p-4 w-full max-w-3xl bg-white shadow-sm">
      {/* Header */}
     
      {/* Job Rows */}
      <div className="space-y-2">
        {jobs.map((job, index) => (
          <div
            key={index}
            className=" rounded-md px-4 py-2 flex justify-between items-center text-sm text-gray-700"
          >
            {/* Left: Company */}
            <div className="w-1/3 text-left">{job.company}</div>

            {/* Center: Deadline */}
            <div className="w-1/3 text-center text-orange-500 font-medium">
              Deadline : {job.deadline}
            </div>

            {/* Right: View Button */}
            <div className="w-1/3 text-right">
              <Link href={'/totalJobPost'}>
              <button className="bg-blue-100 text-blue-600 px-4 py-1 rounded-full font-medium">
                View
              </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
       
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
