'use client'
import { FcGoogle } from "react-icons/fc";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useRouter } from "next/navigation";
import Link from "next/link";


const LoginForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    
    const router = useRouter();
  const togglePassword = () => setShowPassword(prev => !prev);

  const onSubmit = data => {
    console.log(data);
    router.push('/createProfile')
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-xl bg-white shadow-xl rounded-lg p-8"
      >
        {/* Title */}
        <h2 className="text-center text-2xl font-semibold text-orange-500 mb-6">Login</h2>

        {/* Email Field */}
        <div className="mb-4">
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

        {/* Password Field */}
        <div className="mb-4 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            {...register('password', { required: 'Password is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 pr-10"
          />
          <div
            className="absolute top-9 right-3 text-gray-400 cursor-pointer"
            onClick={togglePassword}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me + Forgot Password */}
        <div className="flex items-center justify-between mb-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-orange-500" />
            <span>Remember me</span>
          </label>
          <Link href={'/sendEmail'}>
          <p  className="text-orange-500 hover:underline">
            Forgot password?
          </p>
          </Link>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md font-semibold"
        >
          Sign In
        </button>

        {/* Continue with Google */}
        <div className="mt-4">
          <button className="w-full border border-gray-300 py-2 rounded-md flex items-center justify-center gap-2 text-sm">
            <FcGoogle />
            Continue with google
          </button>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/signUp" className="text-orange-500 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
