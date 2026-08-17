'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { IoMdPlay } from 'react-icons/io'
import Banner from '@/app/component/home/Banner'
import Features from '@/app/component/home/Features'
import Join from '@/app/component/home/Join'
import Stats from '@/app/component/home/Stats'
import { ChefHat } from 'lucide-react'

const HomePage = () => {
  const [showModal, setShowModal] = useState(false)
  const [rating, setRating] = useState(0)

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm()

  const onSubmit = (data) => {
    const feedback = { ...data, rating }
    console.log('Feedback submitted:', feedback)
    setShowModal(false)
    reset()
    setRating(0)
  }

  const closeModal = () => {
    setShowModal(false)
    reset()
    setRating(0)
  }

  return (
    <div>
      <Banner />
      <Stats />
      <Features />
      <Join />

      {/* Feedback Button */}
      <div className="fixed top-96 right-4">
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#679046] text-white px-4 py-2 md:py-3 rounded-md text-sm font-medium w-[100px] md:w-auto relative z-10"
        >
          Feedback!!!
        </button>
        <IoMdPlay
          size={40}
          className="text-[#679046] rotate-180 absolute top-4 md:top-6 right-4 z-0"
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center font-poppins">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative animate-fade-in">
            {/* Close Icon */}
            <button onClick={closeModal} className="absolute top-4 right-4 text-xl text-gray-600">×</button>

            {/* Title */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[#F57C00] text-xl"><ChefHat/></span>
              <h2 className="text-lg font-semibold">Help Us improve CookConnect!</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Role */}
              <div>
                <p className="font-medium mb-2">I am using CookConnect as:</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 border rounded-md p-2 cursor-pointer">
                    <input type="radio" value="cook" {...register("role", { required: true })} />
                    A cook looking for job opportunities
                  </label>
                  <label className="flex items-center gap-2 border rounded-md p-2 cursor-pointer">
                    <input type="radio" value="employer" {...register("role", { required: true })} />
                    An employer looking to hire cooks
                  </label>
                  {errors.role && <p className="text-red-500 text-sm">Please select an option</p>}
                </div>
              </div>

              {/* Goal Helpfulness */}
              <div>
                <p className="font-medium mb-2">Did CookConnect help you achieve your goal?</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 border border-green-300 rounded-md p-2 cursor-pointer text-green-700">
                    <input type="radio" value="yes" {...register("helpful", { required: true })} />
                    ✅ Yes, it was very helpful! 👍
                  </label>
                  <label className="flex items-center gap-2 border border-red-300 rounded-md p-2 cursor-pointer text-red-700">
                    <input type="radio" value="no" {...register("helpful", { required: true })} />
                    ❌ No, I need more help 👎
                  </label>
                  {errors.helpful && <p className="text-red-500 text-sm">Please select an option</p>}
                </div>
              </div>

              {/* Rating */}
              <div className=''>
                <p className="font-medium mb-2">How would you rate your overall experience?</p>
                <div className="flex justify-center gap-1 text-yellow-400 text-2xl cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setRating(star)}
                      className={star <= rating ? "text-yellow-400" : "text-gray-300"}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-xs text-center text-gray-500 mt-1">Click to rate your experience</p>
              </div>

              {/* Comments */}
              <div>
                <p className="font-medium mb-2">Any additional comments or suggestions? (Optional)</p>
                <textarea
                  {...register("comments")}
                  placeholder="Tell us how we can make CookConnect even better for you..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Maybe Later
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage
