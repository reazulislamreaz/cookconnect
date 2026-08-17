'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import ReCAPTCHA from 'react-google-recaptcha';
import { useRouter } from 'next/navigation';

const SITE_KEY = 'YOUR_SITE_KEY_HERE'; // 🔁 Replace with your real site key

const SignUpForm = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
const router = useRouter();
  const onSubmit = (data) => {
    // if (!captchaToken) {
    //   alert('Please complete the reCAPTCHA');
    //   return;
    // }
    console.log('Form Data:', data);
      router.push('/signIn')
    // console.log('Captcha Token:', captchaToken);
    // Add signup submission logic here (e.g. send to API)
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md"
      >
        <h2 className="text-center text-2xl font-semibold text-orange-500 mb-6">Sign Up</h2>

        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            placeholder="Enter your user name"
            {...register('name', { required: 'Full name is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            {...register('email', { required: 'Email is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

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
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div className="mb-4 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
          <input
            type={showConfirm ? 'text' : 'password'}
            placeholder="Enter password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: value => value === watch('password') || 'Passwords do not match',
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

        {/* Terms and Conditions */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            {...register('terms', { required: 'You must agree to the terms' })}
            className="accent-orange-500 text-white"
          />
          <label className="text-sm text-gray-700">
            Agree With{' '}
            <a href="#" className="text-blue-600 underline">Terms & Conditions</a>
          </label>
        </div>
        {errors.terms && <p className="text-red-500 text-sm mb-2">{errors.terms.message}</p>}

        {/* Google reCAPTCHA */}
        {/* <div className="flex justify-center mb-4">
          <ReCAPTCHA
            sitekey={"6LerEIUrAAAAAPnwg4FrL6KmKkMnnh6kJTTdu3xa"}
            onChange={token => setCaptchaToken(token)}
            className="mx-auto"
          />
        </div> */}

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md font-semibold"
        >
          Sign up
        </button>

        {/* Continue with Google */}
        <button
          type="button"
          className="w-full border border-gray-300 py-2 mt-4 rounded-md flex items-center justify-center gap-2 text-sm hover:shadow"
        >
          <FcGoogle className="text-lg" />
          Continue with google
        </button>

        {/* Already have account */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/signIn" className="text-orange-500 font-medium hover:underline">
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUpForm;
