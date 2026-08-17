'use client'
import { CheckCircle, CalendarDays, MapPin, Briefcase, DollarSign, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';



export default function JobDetailsPage() {
const [send,setSend]=useState(false)
    const job = {
  title: "Looking For A Chef Specializing In Moroccan Cuisine",
  company: "The King's Table",
  location: "Casablanca",
  contractType: "CDI (Permanent Contract)",
  salaryRange: "8000–12000 MAD",
  deadlineDate: "02/28/2024",
  specialties: ["Moroccan Cuisine", "French Cuisine"],
  fullDescription: [
    "We are looking for an experienced chef to join our dynamic team in our restaurant located in the heart of Casablanca.",
    "The ideal candidate will have extensive expertise in traditional Moroccan cuisine while also being able to bring their creativity to modernizing our dishes. You will work in a kitchen equipped with modern equipment and lead a team of three cooks.",
    "We offer a stimulating work environment with opportunities for advancement and ongoing training. Our restaurant is renowned for the quality of its cuisine and exceptional customer service."
  ],
  requirements: [
    "Minimum 5 Years Of Experience In Moroccan Cuisine",
    "Diploma In Culinary Arts Or Equivalent",
    "Ability To Manage A Team",
    "Creativity And Passion For Cooking",
    "Availability To Work Evenings And Weekends"
  ],
  benefits: [
    "Competitive Salary With Performance Bonuses",
    "Continuing Education",
    "Health Insurance",
    "Paid Leave",
    "Meals Provided"
  ],
  statistics: {
    applications: 2,
    views: 45,
    publishedSince: "521 Days"
  },
  avatarUrl: "/avatar.jpg",
  avatarInitial: "K",
  applicationStatus: send
};
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-poppins">
      <div className="container mx-auto">
        <Link href="/allJobs" className="flex items-center  text-gray-600 hover:text-gray-800 mb-6">
        <ArrowLeft className='w-3'/>
          <span className="text-sm"> Job Details</span>
        </Link>

        {/* Job Header */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200 mb-6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 leading-snug">{job.title}</h1>
              <p className="text-gray-600 mt-1">{job.company}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" /> {job.location}
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" /> {job.contractType}
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" /> {job.salaryRange}
                </div>
              </div>
              <div className="mt-4 text-sm text-red-500 flex items-center">
                <CalendarDays className="h-4 w-4 mr-1" /> Deadline: {job.deadlineDate}
              </div>
            </div>
      
          </div>
        </div>

        {/* Specialties */}
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200 mb-6">
          <h2 className="font-semibold text-gray-800 text-base mb-3">Specialties Sought</h2>
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-wrap gap-2">
              {job.specialties.map((s, i) => (
                <span key={i} className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                  {s}
                </span>
              ))}
            </div>
         
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Job Description</h3>
              <div className="space-y-3 text-sm text-gray-700">
                {job.fullDescription.map((desc, i) => <p key={i}>{desc}</p>)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Requirements</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="text-green-500 h-4 w-4 mr-2 mt-1" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
        
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Benefits</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {job.benefits.map((b, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="text-green-500 h-4 w-4 mr-2 mt-1" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Statistics</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Applications</span>
                  <span className="font-medium">{job.statistics.applications}</span>
                </div>
                <div className="flex justify-between">
                  <span>Views</span>
                  <span className="font-medium">{job.statistics.views}</span>
                </div>
                <div className="flex justify-between">
                  <span>Published Since</span>
                  <span className="font-medium">{job.statistics.publishedSince}</span>
                </div>
              </div>
            </div>
            {/* Apply button */}
                  <div className="mt-6">
                {job.applicationStatus === true ? (
                  <div className="bg-white border border-gray-200 rounded-md p-4"  onClick={() => setSend(false)}>
                    <h3 className="text-base font-semibold text-gray-800 mb-3">Interested In This Position?</h3>
                    <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
                      <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold text-green-700 text-sm">Application Sent!</p>
                      <p className="text-xs text-green-600">The Employer Will Receive Your Profile Shortly.</p>
                    </div>
                  </div>
                ) : (
                  <button onClick={()=>setSend(!send)}  className="bg-orange-500 text-white px-6 py-2 rounded-md text-sm hover:bg-orange-600">
                    Apply Now
                  </button>
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
