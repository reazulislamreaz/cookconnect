'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SetNewPasswordForm = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
const router = useRouter();
  const onSubmit = (data) => {
    console.log('New password data:', data);
    // You can handle password update logic here
    router.push('/signIn')
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md"
      >
        {/* Title */}
        <h2 className="text-center text-2xl font-semibold text-gray-800 mb-2">
          Set a new password
        </h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Create a new password. Ensure it differs from<br />previous ones for security
        </p>

        {/* Password */}
        <div className="mb-4 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            {...register('password', { required: 'Password is required' })}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <div
            className="absolute top-9 right-3 text-gray-500 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="mb-6 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            type={showConfirm ? 'text' : 'password'}
            placeholder="Enter password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: value =>
                value === watch('password') || 'Passwords do not match',
            })}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <div
            className="absolute top-9 right-3 text-gray-500 cursor-pointer"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md font-semibold transition duration-200"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

export default SetNewPasswordForm;
