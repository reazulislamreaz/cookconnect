'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';

const RestaurantProfileForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
const router = useRouter()
  const onSubmit = (data) => {
    console.log('Submitted restaurant profile:', data);
    router.push('/resturentDashboard')
    // Add API logic here
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-white px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-xl bg-white border border-gray-200 rounded-lg p-6 shadow"
      >
        {/* Icon + Heading */}
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🏢</div>
          <h2 className="text-xl font-semibold text-gray-800">Complete your restaurant Profile</h2>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name of restaurant/establishment <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="type here..."
              {...register('name', { required: 'Restaurant name is required' })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <select
              {...register('city', { required: 'City is required' })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Select</option>
              <option value="New York">New York</option>
              <option value="Dhaka">Dhaka</option>
              <option value="London">London</option>
            </select>
            {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Type here..."
              {...register('address', { required: 'Address is required' })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
          </div>

          {/* Business Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business email</label>
            <input
              type="email"
              placeholder="type here..."
              {...register('email')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="type here..."
              {...register('phone', { required: 'Phone number is required' })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <p className="text-xs text-gray-500 mt-1">Will be verified by WhatsApp</p>
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
          </div>

          {/* Type of Establishment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type of establishment
            </label>
            <select
              {...register('type')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Select</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Cafe">Cafe</option>
              <option value="Catering">Catering</option>
            </select>
          </div>

          {/* Social Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Social Link</label>
            <input
              type="url"
              placeholder="Type social media link"
              {...register('social')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md font-semibold transition"
        >
          Next
        </button>
      </form>
    </div>
  );
};

export default RestaurantProfileForm;
