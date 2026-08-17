"use client"

import { MapPin, Briefcase, CalendarDays, Clock } from "lucide-react"

import Link from "next/link"

export default function JobCard({ job }) {
  return (

    <div className="relative overflow-hidden border border-gray-200 rounded-lg bg-white p-6 shadow-sm font-poppins">
      {job.isNew && (
        <span className="absolute right-4 top-1 sm:top-4 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">
          New
        </span>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
          <p className="text-sm text-gray-600">{job.company}</p>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <MapPin className="mr-1 h-4 w-4" />
            <span>{job.location}</span>
            <Briefcase className="ml-4 mr-1 h-4 w-4" />
            <span>{job.experience}</span>
          </div>
          <span className="inline-block mt-3 bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded mr-3">
            Chef
          </span>
          <span className="inline-block mt-3 bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
            With Accommondation
          </span>
        </div>


      </div>

      <p className="mt-4 text-sm text-gray-700">{job.description}</p>

      <div className="mt-4">
        <h4 className="font-medium text-gray-800">Requirements:</h4>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
          {job.requirements.slice(0, 2).map((req, index) => (
            <li key={index}>{req}</li>
          ))}
        </ul>
        {job.requirements.length > 2 && (
          <p  className="mt-1 inline-block text-sm text-orange-500 ">
            +{job.requirements.length - 2} more requirements
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-500">
        <div className="flex items-center">
          <CalendarDays className="mr-1 h-4 w-4" />
          <span>Posted {job.postedDate}</span>
        </div>
        <div className="flex items-center">
          <Clock className="mr-1 h-4 w-4" />
          <span>Deadline {job.deadlineDate}</span>
        </div>
        <Link href={`/allJobs/${job?.id}`}>
        
        <button className="bg-orange-500  text-white px-6 py-2 rounded-md text-sm font-medium">
        View Details
        </button>
        </Link>
      </div>
    </div>

  )
}
