"use client"

import { useState } from "react"
import { Search, SlidersHorizontal } from "lucide-react"
import { Input, Select } from "antd"
import Pagination from "../../component/allJobs/pagination"
import JobCard from "../../component/allJobs/JobCard"
import JobOffersBanner from "../../component/allJobs/JobOffersBanner"

const { Option } = Select

export const jobListings = [
  {
    id: 1,
    title: "Head Chef Position - Luxury Resort",
    company: "Four Seasons Casablanca",
    location: "Casablanca",
    experience: "05 Years Exp.",
    description:
      "We are seeking an experienced head chef to lead our kitchen team in our luxury resort. The ideal candidate will have extensive experience in fine dining and team management.",
    requirements: [
      "Minimum 5 years as head chef",
      "Experience in luxury hospitality",
      "Strong leadership skills",
      "Culinary degree or equivalent",
    ],
    postedDate: "Jan 15, 2024",
    deadlineDate: "Feb 15, 2024",
    isNew: true,
    avatarUrl: "/placeholder.svg?height=40&width=40",
    avatarInitial: "K",
  },
  {
    id: 2,
    title: "Head Chef Position - Luxury Resort",
    company: "Four Seasons Casablanca",
    location: "Casablanca",
    experience: "05 Years Exp.",
    description:
      "We are seeking an experienced head chef to lead our kitchen team in our luxury resort. The ideal candidate will have extensive experience in fine dining and team management.",
    requirements: [
      "Minimum 5 years as head chef",
      "Experience in luxury hospitality",
      "Strong leadership skills",
      "Culinary degree or equivalent",
    ],
    postedDate: "Jan 15, 2024",
    deadlineDate: "Feb 15, 2024",
    isNew: true,
    avatarUrl: "/placeholder.svg?height=40&width=40",
    avatarInitial: "K",
  },
  {
    id: 3,
    title: "Head Chef Position - Luxury Resort",
    company: "Four Seasons Casablanca",
    location: "Casablanca",
    experience: "05 Years Exp.",
    description:
      "We are seeking an experienced head chef to lead our kitchen team in our luxury resort. The ideal candidate will have extensive experience in fine dining and team management.",
    requirements: [
      "Minimum 5 years as head chef",
      "Experience in luxury hospitality",
      "Strong leadership skills",
      "Culinary degree or equivalent",
    ],
    postedDate: "Jan 15, 2024",
    deadlineDate: "Feb 15, 2024",
    isNew: false,
    avatarUrl: "/placeholder.svg?height=40&width=40",
    avatarInitial: "K",
  },
  {
    id: 4,
    title: "Head Chef Position - Luxury Resort",
    company: "Four Seasons Casablanca",
    location: "Casablanca",
    experience: "05 Years Exp.",
    description:
      "We are seeking an experienced head chef to lead our kitchen team in our luxury resort. The ideal candidate will have extensive experience in fine dining and team management.",
    requirements: [
      "Minimum 5 years as head chef",
      "Experience in luxury hospitality",
      "Strong leadership skills",
      "Culinary degree or equivalent",
    ],
    postedDate: "Jan 15, 2024",
    deadlineDate: "Feb 15, 2024",
    isNew: false,
    avatarUrl: "/placeholder.svg?height=40&width=40",
    avatarInitial: "K",
  },
  {
    id: 5,
    title: "Head Chef Position - Luxury Resort",
    company: "Four Seasons Casablanca",
    location: "Casablanca",
    experience: "05 Years Exp.",
    description:
      "We are seeking an experienced head chef to lead our kitchen team in our luxury resort. The ideal candidate will have extensive experience in fine dining and team management.",
    requirements: [
      "Minimum 5 years as head chef",
      "Experience in luxury hospitality",
      "Strong leadership skills",
      "Culinary degree or equivalent",
    ],
    postedDate: "Jan 15, 2024",
    deadlineDate: "Feb 15, 2024",
    isNew: false,
    avatarUrl: "/placeholder.svg?height=40&width=40",
    avatarInitial: "K",
  },
  {
    id: 6,
    title: "Head Chef Position - Luxury Resort",
    company: "Four Seasons Casablanca",
    location: "Casablanca",
    experience: "05 Years Exp.",
    description:
      "We are seeking an experienced head chef to lead our kitchen team in our luxury resort. The ideal candidate will have extensive experience in fine dining and team management.",
    requirements: [
      "Minimum 5 years as head chef",
      "Experience in luxury hospitality",
      "Strong leadership skills",
      "Culinary degree or equivalent",
    ],
    postedDate: "Jan 15, 2024",
    deadlineDate: "Feb 15, 2024",
    isNew: false,
    avatarUrl: "/placeholder.svg?height=40&width=40",
    avatarInitial: "K",
  },
  {
    id: 7,
    title: "Head Chef Position - Luxury Resort",
    company: "Four Seasons Casablanca",
    location: "Casablanca",
    experience: "05 Years Exp.",
    description:
      "We are seeking an experienced head chef to lead our kitchen team in our luxury resort. The ideal candidate will have extensive experience in fine dining and team management.",
    requirements: [
      "Minimum 5 years as head chef",
      "Experience in luxury hospitality",
      "Strong leadership skills",
      "Culinary degree or equivalent",
    ],
    postedDate: "Jan 15, 2024",
    deadlineDate: "Feb 15, 2024",
    isNew: false,
    avatarUrl: "/placeholder.svg?height=40&width=40",
    avatarInitial: "K",
  },
  {
    id: 8,
    title: "Head Chef Position - Luxury Resort",
    company: "Four Seasons Casablanca",
    location: "Casablanca",
    experience: "05 Years Exp.",
    description:
      "We are seeking an experienced head chef to lead our kitchen team in our luxury resort. The ideal candidate will have extensive experience in fine dining and team management.",
    requirements: [
      "Minimum 5 years as head chef",
      "Experience in luxury hospitality",
      "Strong leadership skills",
      "Culinary degree or equivalent",
    ],
    postedDate: "Jan 15, 2024",
    deadlineDate: "Feb 15, 2024",
    isNew: false,
    avatarUrl: "/placeholder.svg?height=40&width=40",
    avatarInitial: "K",
  },
  {
    id: 9,
    title: "Product Manger",
    company: "Four Seasons Casablanca",
    location: "Casablanca",
    experience: "05 Years Exp.",
    description:
      "We are seeking an experienced head chef to lead our kitchen team in our luxury resort. The ideal candidate will have extensive experience in fine dining and team management.",
    requirements: [
      "Minimum 5 years as head chef",
      "Experience in luxury hospitality",
      "Strong leadership skills",
      "Culinary degree or equivalent",
    ],
    postedDate: "Jan 15, 2024",
    deadlineDate: "Feb 15, 2024",
    isNew: false,
    avatarUrl: "/placeholder.svg?height=40&width=40",
    avatarInitial: "K",
  },
]
export default function JobDashboardPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)
  const [city, setCity] = useState(null)
  const [contract, setContract] = useState(null)

  const jobsPerPage = 6

  const handleClearFilters = () => {
    setCity(null)
    setContract(null)
    setSearchTerm("")
    setFilterOpen(false)
    console.log("Filters cleared")
  }

  const handleFilterToggle = () => {
    setFilterOpen(!filterOpen)
  }

  const filteredJobs = jobListings.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCity = city ? job.location === city : true
    const matchesContract = contract ? job.contractType === contract : true

    return matchesSearch && matchesCity && matchesContract
  })

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage)
  const indexOfLastJob = currentPage * jobsPerPage
  const indexOfFirstJob = indexOfLastJob - jobsPerPage
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  return (
    <div>
      <JobOffersBanner />
      <div className="min-h-screen bg-gray-50 p-6 font-poppins">
        <div className="container mx-auto">
          <div className={`bg-white border border-gray-300 p-4 rounded-md mb-8 transition-all duration-300 ${filterOpen ? "space-y-4" : ""}`}>
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
                onClick={handleFilterToggle}
                className="flex items-center space-x-2 px-4 py-2 border rounded-md bg-white hover:bg-gray-100"
              >
                <SlidersHorizontal className="h-5 w-5" />
                <span>Filters</span>
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
                  <label className="text-sm font-medium text-gray-700">Accommodation</label>
                  <Select
                    className="w-full"
                    placeholder="Select your city"
                    value={city}
                    onChange={(value) => setCity(value)}
                    allowClear
                  >
                    <Option value="withAccommodations">With Accommodations</Option>
                    <Option value="withoutAccommondation">Without Accommodations</Option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Type of Contract</label>
                  <Select
                    className="w-full"
                    placeholder="Select your contract"
                    value={contract}
                    onChange={(value) => setContract(value)}
                    allowClear
                  >
                    <Option value="CDI">CDI</Option>
                    <Option value="CDD">CDD</Option>
                  </Select>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  )
}
