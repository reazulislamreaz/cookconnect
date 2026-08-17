"use client"

import React from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const NotificationDetailsPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6 font-poppins">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* Back button */}
        <Link href="/notification">
          <div className="flex items-center text-gray-600 hover:text-gray-800 cursor-pointer mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Back to Notifications</span>
          </div>
        </Link>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          A new Product is added
        </h1>

        {/* Timestamp */}
        <p className="text-sm text-gray-500 mb-6">20-Dec-2024, 3:00 PM</p>

        {/* Message */}
        <p className="text-base text-gray-700 leading-relaxed">
          Product name, Brand name, Price <strong>$1070,000</strong> is added to our collection! Check it out in your product dashboard to explore more details or edit as necessary.
        </p>
      </div>
    </div>
  )
}

export default NotificationDetailsPage
