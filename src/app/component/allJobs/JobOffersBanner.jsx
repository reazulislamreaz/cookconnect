"use client"

import { Briefcase, MapPin, Clock, ArrowLeft } from "lucide-react"
// import Link from "next/link"

export default function JobOffersBanner() {
  return (
    <div className="bg-green-50 py-10 px-4 text-center font-poppins">
              {/* <Link href="/allJobs" className="flex items-center container mx-auto  text-gray-600 hover:text-gray-800 mb-6">
        <ArrowLeft className='w-3'/>
          <span className="text-sm"> Job Details</span>
        </Link> */}
      <h2 className="text-2xl font-semibold text-green-700">Job Offers</h2>
      <p className="text-sm text-green-600 mt-1">Discover The Latest Opportunities In Catering</p>

      <div className="mt-4 flex flex-wrap justify-center items-center gap-6 text-sm text-green-700">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>20 Offers Available</span>
        </div>
        <div className="flex items-center gap-1">
          <Briefcase className="h-4 w-4" />
          <span>All Types Of Establishments</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>All Cities</span>
        </div>
      </div>
    </div>
  )
}
