import React, { useState } from 'react';
import Link from 'next/link';
import { FaSearch } from 'react-icons/fa';
import { MdArrowOutward } from 'react-icons/md';
import { Modal } from 'antd';
import { UserOutlined, ShopOutlined } from '@ant-design/icons';
import { ChefHat, LucideBuilding2 } from 'lucide-react';

const Banner = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  return (
    <div className="bg-[#E8EFE3] flex items-center justify-center px-4 py-16 font-poppins">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-6 leading-tight">
          Connect Chefs with <span className="text-[#679046]">Restaurants</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Find the perfect culinary talent or your next kitchen opportunity
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/jobProfile">
            <button className="bg-[#679046] hover:bg-green-700 text-white text-sm font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 w-full sm:w-auto">
              Discover Profiles
              <FaSearch className="w-5 h-5" />
            </button>
          </Link>

          <button
            onClick={showModal}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 w-full sm:w-auto"
          >
            Get Started Now
            <MdArrowOutward className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Ant Design Modal */}
      <Modal
        title={<div className="text-center flex flex-col justify-center items-center font-bold text-xl">
          <ChefHat size={24} className='w-12 text-[#E87B35]' />
          <h1 className='text-center font-bold text-lg'>Join CookConnekt</h1>
        </div>}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        centered
      >
        <p className="text-center text-gray-500 mb-6">Choose your account type to get started</p>
        <div className="flex flex-col gap-4">
          <Link href="/signIn">
            <div className="border rounded-lg p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <span className='bg-[#F0F4EC] p-2 rounded-md'>

                  <ChefHat className="text-[#679046] text-2xl" />
                </span>
                <div>
                  <p className="font-semibold">I am a cook</p>
                  <p className="text-gray-500 text-sm">Create your professional account and find opportunity</p>
                </div>
              </div>
              <MdArrowOutward className="text-gray-400" />
            </div>
          </Link>

          <Link href="/resturentProfileForm">
            <div className="border rounded-lg p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <span className='bg-[#D9F9E6] p-2 rounded-md'>             <LucideBuilding2 className="text-[#679046] text-2xl" /></span>
                <div>
                  <p className="font-semibold">I am Restaurant/Employer</p>
                  <p className="text-gray-500 text-sm">Find culinary talent and post your offers</p>
                </div>
              </div>
              <MdArrowOutward className="text-gray-400" />
            </div>
          </Link>
        </div>
      </Modal>
    </div>
  );
};

export default Banner;
