"use client"

import { useState } from "react"
import { Search, SlidersHorizontal, Bookmark, Award, Eye } from "lucide-react"
import { Input, Select } from "antd"
import Pagination from "../../component/allJobs/pagination"
import Image from "next/image"
import { TiLocationOutline } from "react-icons/ti"
import { CiStar } from "react-icons/ci"
import chef from '../../../assets/Ellipse 3.png'
import BestProfile from "../../component/allJobs/BestProfile"
import Link from "next/link"
const { Option } = Select

const sampleCandidates = Array.from({ length: 24 }, (_, index) => ({
  id: index + 1,
  name: "Amina Benali",
  position: "Chef",
  location: "Casablanca",
  experience: "8 Years Of Experience",
  specialties: ["Moroccan Cuisine", "French Cuisine"],
  image:chef,
}))

export default function JobDashboardPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [city, setCity] = useState(null)
  const [experience, setExperience] = useState(null)
  const [job, setJob] = useState(null)
  const [specialty, setSpecialty] = useState(null)

  const candidatesPerPage = 12

  const filteredCandidates = sampleCandidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCity = city ? candidate.location === city : true
    const matchesExperience = experience ? candidate.experience === experience : true
    const matchesJob = job ? candidate.position === job : true
    const matchesSpecialty = specialty
      ? candidate.specialties.includes(specialty)
      : true

    return (
      matchesSearch &&
      matchesCity &&
      matchesExperience &&
      matchesJob &&
      matchesSpecialty
    )
  })

  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage)
  const indexOfLastCandidate = currentPage * candidatesPerPage
  const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage
  const currentCandidates = filteredCandidates.slice(indexOfFirstCandidate, indexOfLastCandidate)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handleClearFilters = () => {
    setCity(null)
    setExperience(null)
    setJob(null)
    setSpecialty(null)
    setSearchTerm("")
    setFilterOpen(false)
  }

  return (
    <div>
      <BestProfile />
      <div className="min-h-screen bg-gray-50 p-6 font-poppins">
        <div className="container mx-auto">
          <div className="bg-white border border-gray-300 p-4 rounded-md mb-8 transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search here..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center space-x-2 px-4 py-2 border rounded-md bg-white hover:bg-gray-100"
              >
                <SlidersHorizontal className="h-5 w-5" />
                <span>Advance Filters</span>
              </button>
            </div>

            {filterOpen && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mt-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">City</label>
                  <Select
                    className="w-full"
                    placeholder="Select your city"
                    value={city}
                    onChange={(value) => setCity(value)}
                    allowClear
                  >
                    <Option value="Casablanca">Casablanca</Option>
                    <Option value="Marrakech">Marrakech</Option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Job</label>
                  <Select
                    className="w-full"
                    placeholder="Select..."
                    value={job}
                    onChange={(value) => setJob(value)}
                    allowClear
                  >
                    <Option value="Chef">Chef</Option>
                    <Option value="Manager">Manager</Option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Specialty</label>
                  <Select
                    className="w-full"
                    placeholder="Select..."
                    value={specialty}
                    onChange={(value) => setSpecialty(value)}
                    allowClear
                  >
                    <Option value="Moroccan Cuisine">Moroccan Cuisine</Option>
                    <Option value="French Cuisine">French Cuisine</Option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Experience</label>
                  <Select
                    className="w-full"
                    placeholder="Select..."
                    value={experience}
                    onChange={(value) => setExperience(value)}
                    allowClear
                  >
                    <Option value="8 Years Of Experience">8 Years Of Experience</Option>
                    <Option value="5 Years of Experience">5 Years of Experience</Option>
                  </Select>
                </div>
              </div>
            )}

            {filterOpen && (
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCandidates.map((candidate) => (
              <div key={candidate.id} className="bg-white p-4 rounded-xl shadow border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-14 h-14">
                      <Image
                        src={candidate.image}
                        alt="avatar"
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-xs p-1 rounded-full">
                        <Award className="w-4 h-4"/>
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-base text-gray-900">{candidate.name}</p>
                      <p className="text-sm text-gray-500">{candidate.position}</p>
                    </div>
                  </div>
                  <button className="text-gray-500 flex items-center gap-1">
                    <Bookmark className="w-5 h-5" />
                    <span className="text-sm">Save</span>
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <TiLocationOutline />
                  <span>{candidate.location}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                  <CiStar />
                  <span>{candidate.experience}</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {candidate.specialties.map((spec, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                      {spec}
                    </span>
                  ))}
                </div>
<Link href={`/jobProfile/${candidate?.id}`}>

                <button className="w-full mt-4 flex items-center justify-center gap-2 bg-orange-500 text-white text-sm py-2 rounded-md hover:bg-orange-600">
                  <Eye className="w-4"/> View Full Profile
                </button>
</Link>
              </div>
            ))}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>
    </div>
  )
}
