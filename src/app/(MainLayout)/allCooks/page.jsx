"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowLeft, Search, Eye, Star, Trash2 } from "lucide-react"
import { Modal } from "antd"
import { AiOutlineStar, AiFillStar } from "react-icons/ai"
import chef from "../../../assets/chefImage.png"
import Link from "next/link"

export default function AllCooksList() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedChef, setSelectedChef] = useState(null)
  const [rating, setRating] = useState(0)

  const openRatingModal = (chefName) => {
    setSelectedChef(chefName)
    setIsModalOpen(true)
    setRating(0) // reset previous rating
  }

  const handleSend = () => {
    console.log(`Rated ${selectedChef} with ${rating} stars`)
    setIsModalOpen(false)
  }

  const cooks = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: "Amina Benali",
    specialties: ["Moroccan Cuisine", "French Cuisine"],
    profilePic: chef,
  }))

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header and Search */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 space-y-4 md:space-y-0 w-[60%]">
            <Link href={`/resturentDashboard`}>
          <div className="flex items-center ">
            
            <ArrowLeft className="w-5 h-5 text-gray-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-800">All Cooks</h1>
          </div>
            </Link>
          <div className="relative w-full text-center md:w-auto md:min-w-[300px]">
            <input
              type="text"
              placeholder="Search here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {/* Cooks List */}
        <div className="space-y-4">
          {cooks.map((cook) => (
            <div
              key={cook.id}
              className="bg-white rounded-lg shadow-sm p-4 flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0"
            >
              <div className="flex items-center flex-grow">
                <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
                  <Image
                    src={cook.profilePic}
                    alt={cook.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full"
                  />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-800">{cook.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {cook.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="bg-[#DEEAFC] text-[#263FB0] text-xs font-medium px-2.5 py-0.5 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto justify-end">
                <Link href={`/jobProfile/${cook.id}`}>
                  <button className="flex items-center justify-center px-3 py-2 bg-[#E87B35] text-white text-sm rounded-md hover:bg-orange-600 transition-colors">
                    <Eye className="w-4 h-4 mr-1" />
                    View Full Profile
                  </button>
                </Link>
                <button
                  onClick={() => openRatingModal(cook.name)}
                  className="flex items-center justify-center px-3 py-2 bg-[#679046] text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                >
                  <Star className="w-4 h-4 mr-1" />
                  Rate This Chef
                </button>
                <button className="flex items-center justify-center px-3 py-2 bg-[#EA3323] text-white text-sm rounded-md hover:bg-red-600 transition-colors">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rating Modal */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        closeIcon={<span className="text-lg font-bold">×</span>}
      >
        <div className="text-center py-4">
          <h2 className="text-xl font-semibold mb-4">Rating</h2>
          <div className="flex justify-center gap-1 mb-6">
            {[1, 2, 3, 4, 5].map((val) => (
              <span
                key={val}
                onClick={() => setRating(val)}
                className="cursor-pointer text-2xl"
              >
                {rating >= val ? <AiFillStar className="text-[#F3B63A]" /> : <AiOutlineStar />}
              </span>
            ))}
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-[#EA3323] text-white px-6 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="bg-[#679046] text-white px-6 py-2 rounded-md"
            >
              Send
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
