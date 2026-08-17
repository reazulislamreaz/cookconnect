'use client'
import { useRouter } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';

const EnterEmailForm = () => {
    const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = data => {
    console.log('Email submitted:', data);
    router.push('/verifyCode')
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md"
      >
        {/* Title */}
        <h2 className="text-center text-2xl font-semibold text-gray-800 mb-2">
          Enter your email
        </h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Please enter your email
        </p>

        {/* Email Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            {...register('email', { required: 'Email is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md font-semibold transition duration-200"
        >
          Next
        </button>
      </form>
    </div>
  );
};

export default EnterEmailForm;
