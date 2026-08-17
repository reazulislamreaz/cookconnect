'use client';

import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FaRegUser } from 'react-icons/fa';

export default function BusinessProfileForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: 'Omar Bennani',
      phoneNumber: '+333 3258 586 5856',
      city: '',
      address: '2 years',
      businessMail: 'Sous-Chef',
      businessType: 'Sous-Chef',
    },
  });

  const onSubmit = (data) => {
    console.log('Form submitted:', data);
  };

  return (
<div className='w-full max-w-5xl mt-3 mx-auto'>
            {/* Top Back Nav */}
        <Link href={'/resturentProfile'}>
        <div className="flex items-center mb-4">
          <ArrowLeft className="w-5 h-5 text-gray-600 mr-2" />
          <span className="text-sm text-gray-600 font-medium">Profile</span>
        </div>
        </Link>
                {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-full border-2 border-[#2047B8] overflow-hidden flex items-center justify-center mb-4">
        
                  <FaRegUser size={30} className="text-[#2047B8]" />
         
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Edit My Profile</h1>
              <p className="text-sm text-gray-500 text-center">Keep your profile up to date to maximize your opportunity</p>
            </div>
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-6 sm:p-10 rounded-lg border shadow max-w-5xl mx-auto"
    >
      <h2 className="text-center text-lg font-semibold text-gray-800 mb-8">
        Profile Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full name<span className="text-red-500">*</span>
          </label>
          <input
            {...register('fullName', { required: 'Full name is required' })}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Your full name"
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone number<span className="text-red-500">*</span>
          </label>
          <input
            {...register('phoneNumber', { required: 'Phone number is required' })}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="+123 456 7890"
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City<span className="text-red-500">*</span>
          </label>
          <select
            {...register('city', { required: 'City is required' })}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">Select your city</option>
            <option value="Paris">Paris</option>
            <option value="London">London</option>
            <option value="New York">New York</option>
          </select>
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address<span className="text-red-500">*</span>
          </label>
          <input
            {...register('address', { required: 'Address is required' })}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Street, City"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
          )}
        </div>

        {/* Business Mail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Mail<span className="text-red-500">*</span>
          </label>
          <input
            {...register('businessMail', { required: 'Business mail is required' })}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="example@business.com"
          />
          {errors.businessMail && (
            <p className="text-red-500 text-sm mt-1">{errors.businessMail.message}</p>
          )}
        </div>

        {/* Business Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Type<span className="text-red-500">*</span>
          </label>
          <select
            {...register('businessType', { required: 'Business type is required' })}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">Select type</option>
            <option value="Sous-Chef">Sous-Chef</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Catering">Catering</option>
          </select>
          {errors.businessType && (
            <p className="text-red-500 text-sm mt-1">{errors.businessType.message}</p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-center mt-10 gap-4">
        <button
          type="button"
          className="px-6 py-2 rounded-md border border-orange-500 text-orange-500 hover:bg-orange-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded-md bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
        >
          Save Change
        </button>
      </div>
    </form>
</div>
  );
}
