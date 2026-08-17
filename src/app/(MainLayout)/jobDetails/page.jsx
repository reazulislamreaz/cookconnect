"use client"

import { useForm } from "react-hook-form"
import { useMemo, useRef } from "react"
import dynamic from "next/dynamic"
import { ArrowLeft, AlertTriangle, CalendarDays } from "lucide-react"
import Link from "next/link"

// Load JoditEditor only on client
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false })

export default function JobDetailsForm() {
  const editorJobDescription = useRef(null)
  const editorJobBenefits = useRef(null)

  const { register, handleSubmit } = useForm({
    defaultValues: {
      applicationDeadline: "2050-12-31",
    },
  })

  const onSubmit = (data) => {
    console.log("Deadline:", data.applicationDeadline)
  }

  const readonlyConfig = useMemo(
    () => ({
      readonly: true,
      toolbarButtonSize: "small",
      buttons: [],
      showCharsCounter: false,
      showWordsCounter: false,
      showXPathInStatusbar: false,
      height: 200,
    }),
    []
  )

  const config = useMemo(
    () => ({
      readonly: false, 
      toolbarButtonSize: "small",
      buttons: ["bold", "italic", "underline", "|", "ul", "ol", "|", "link", "|", "source"],
      showCharsCounter: false,
      showWordsCounter: false,
      showXPathInStatusbar: false,
      height: 200, // Adjust height as needed
    }),
    [],
  )

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href={"/resturentDashboard"}>
            <div className="flex items-center">
              <ArrowLeft className="w-5 h-5 text-gray-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-800 mr-4">Job Details</h1>
            </div>
          </Link>
          <div className="flex items-center text-orange-500 text-sm bg-orange-50 px-3 py-1 rounded-full">
            <AlertTriangle className="w-4 h-4 mr-1" />
            <span>Job Details Here</span>
            <span className="ml-2 text-gray-600">You can edit only the job deadline</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Readonly Inputs */}
          <input disabled className="hidden" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Offer Title <span className="text-red-500">*</span></label>
            <input
              disabled
              value="Executive Chef"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type <span className="text-red-500">*</span></label>
              <input
                disabled
                value="Full-time"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desired Experience <span className="text-red-500">*</span></label>
              <input
                disabled
                value="3-5 Years"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desired Specialties <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-gray-700">
              {[
                "Moroccan Cuisine",
                "Asian Cuisine",
                "Italian Cuisine",
                "Fast Food",
                "French Cuisine",
                "International Cuisine",
                "Grills",
                "Seafood",
                "Vegetarian Cuisine",
                "Pastry Shop",
                "Bakery",
              ].map((item, i) => (
                <label key={i} className="flex items-center">
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" disabled />
                  <span className="ml-2">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Location <span className="text-red-500">*</span></label>
              <input
                disabled
                value="London"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desired Availability <span className="text-red-500">*</span></label>
              <input
                disabled
                value="Full-time"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Salary <span className="text-red-500">*</span></label>
              <input
                disabled
                value="$60,000 - $70,000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type of Establishment <span className="text-red-500">*</span></label>
              <input
                disabled
                value="Restaurant"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vacancy <span className="text-red-500">*</span></label>
            <input
              disabled
              value="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>

          <label className="flex items-center">
            <input type="checkbox" checked disabled className="form-checkbox h-4 w-4 text-blue-600" />
            <span className="ml-2 text-gray-700">With Accommodation</span>
          </label>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
            <JoditEditor ref={editorJobDescription} value="Job description text..." config={readonlyConfig} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Benefits</label>
            <JoditEditor ref={editorJobBenefits} value="Job benefits text..." config={readonlyConfig} />
          </div> */}
 {/* Job Description */}
          <div className="relative">
            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Job Description<span className="text-red-500">*</span>
            </label>
            <JoditEditor
              ref={editorJobDescription}
              value={"After intigrationyou can see here exact content"}
              config={config}
              tabIndex={1} // tabIndex of textarea
    
            />
    
          </div>

          {/* Job Requirements */}
          <div className="mt-12">
            <label htmlFor="jobBenefits" className="block text-sm font-medium text-gray-700 mb-1">
              Job Requirements<span className="text-red-500">*</span>
            </label>
            <JoditEditor
              ref={editorJobBenefits}
              value={"After intigrationyou can see here exact content"}
              config={config}
              tabIndex={1} // tabIndex of textarea
          
            />
          </div>

          {/* Job Benefits */}
          <div className="mt-12">
            <label htmlFor="jobBenefits" className="block text-sm font-medium text-gray-700 mb-1">
              Job Benefits<span className="text-red-500">*</span>
            </label>
            <JoditEditor
              ref={editorJobBenefits}
              value={"After intigrationyou can see here exact content"}
              config={config}
              tabIndex={1} 
  
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Offer Visibility</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="radio" checked disabled className="form-radio h-4 w-4 text-blue-600" />
                <span className="ml-2 text-gray-700">Public Name and Restaurant Logo (visible)</span>
              </label>
              <label className="flex items-center">
                <input type="radio" disabled className="form-radio h-4 w-4 text-blue-600" />
                <span className="ml-2 text-gray-700">Anonymous (Restaurant Not Specified)</span>
              </label>
            </div>
          </div>

          {/* Only editable field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
            <div className="relative">
              <input
                type="date"
                {...register("applicationDeadline")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
            >
              Edit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
