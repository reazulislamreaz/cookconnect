'use client';

import Pagination from '../../component/allJobs/pagination';
import { ArrowLeft, Award, Bookmark, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { CiStar } from 'react-icons/ci';
import { TiLocationOutline } from 'react-icons/ti';
import chef from '../../../assets/Ellipse 3.png';

const sampleCandidates = Array.from({ length: 13 }, (_, index) => ({
  id: index + 1,
  name: 'Amina Benali',
  position: 'Chef',
  location: 'Casablanca',
  experience: '8 Years Of Experience',
  specialties: ['Moroccan Cuisine', 'French Cuisine'],
  image: chef,
}));

const SaveProfile = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const candidatesPerPage = 6;

  const indexOfLastCandidate = currentPage * candidatesPerPage;
  const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage;
  const currentCandidates = sampleCandidates.slice(indexOfFirstCandidate, indexOfLastCandidate);
  const totalPages = Math.ceil(sampleCandidates.length / candidatesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen  container mx-auto p-4">
                {/* Top Back Nav */}
        <Link href={'/resturentDashboard'}>
        <div className="flex items-center mb-4">
          <ArrowLeft className="w-5 h-5 text-gray-600 mr-2" />
          <span className="text-sm text-gray-600 font-medium">Profile</span>
        </div>
        </Link>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentCandidates.map((candidate) => (
          <div
            key={candidate.id}
            className="bg-white p-4 rounded-xl shadow border border-gray-200"
          >
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
                    <Award className="w-4 h-4" />
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
                <span
                  key={idx}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs"
                >
                  {spec}
                </span>
              ))}
            </div>

            <Link href={`/jobProfile/${candidate?.id}`}>
              <button className="w-full mt-4 flex items-center justify-center gap-2 bg-orange-500 text-white text-sm py-2 rounded-md hover:bg-orange-600">
                <Eye className="w-4" /> View Full Profile
              </button>
            </Link>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        data={sampleCandidates}
      />
    </div>
  );
};

export default SaveProfile;
