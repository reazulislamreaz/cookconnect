

import { Clock } from "lucide-react"

export default function ApplicationCard({ title, company, appliedDate }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white font-poppins">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-base text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{company}</p>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <Clock className="mr-1 h-4 w-4" />
            <span>Applied on {appliedDate}</span>
          </div>
        </div>
        <button className="bg-blue-50 text-blue-600 text-sm font-medium px-4 py-1.5 rounded-full hover:bg-blue-100 transition">
          View
        </button>
      </div>
      <div className="mt-4 text-right">
        <a href="#" className="text-sm text-green-600 hover:underline">
          See the offer
        </a>
      </div>
    </div>
  )
}
