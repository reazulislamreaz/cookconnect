'use client';

import { useForm, Controller } from 'react-hook-form';
import { useRef, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { ArrowLeft, AlertTriangle, CalendarDays } from 'lucide-react';
import Link from 'next/link';

// Dynamically import JoditEditor
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

export default function JobDetailsForm() {
  const editorJobDescription = useRef(null);
  const editorJobBenefits = useRef(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      offerTitle: '',
      contractType: '',
      desiredExperience: '',
      desiredSpecialties: [],
      jobLocation: '',
      desiredAvailability: '',
      proposedSalary: '',
      establishmentType: '',
      vacancy: '',
      withAccommodation: true,
      jobDescription: '',
      jobBenefits: '',
      offerVisibility: 'public',
      applicationDeadline:new Date().toISOString().split('T')[0],
    },
  });

  const config = useMemo(
    () => ({
      readonly: false,
      toolbarButtonSize: 'small',
      buttons: ['bold', 'italic', 'underline', '|', 'ul', 'ol', '|', 'link', '|', 'source'],
      showCharsCounter: false,
      showWordsCounter: false,
      showXPathInStatusbar: false,
      height: 200,
    }),
    []
  );

  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
  };

  const specialties = [
    'Moroccan Cuisine',
    'Asian Cuisine',
    'Italian Cuisine',
    'Fast Food',
    'French Cuisine',
    'International Cuisine',
    'Grills',
    'Seafood',
    'Vegetarian Cuisine',
    'Pastry Shop',
    'Bakery',
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Header */}
          <div className="flex items-center mb-6">
         
              <h1 className="text-xl font-bold text-gray-800 mr-4">Post An Offer</h1>
           
       
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Offer Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register('offerTitle', { required: true })}
              type="text"
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Offer Title"
            />
          </div>

          {/* Contract Type & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Type <span className="text-red-500">*</span>
              </label>
              <select {...register('contractType', { required: true })} className="w-full px-4 py-2 border rounded-lg">
                <option value="">Select</option>
                <option>Full-time</option>
                <option>Part-time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desired Experience <span className="text-red-500">*</span>
              </label>
              <select {...register('desiredExperience', { required: true })} className="w-full px-4 py-2 border rounded-lg">
                <option value="">Select</option>
                <option>1-2 Years</option>
                <option>3-5 Years</option>
              </select>
            </div>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Desired Specialties <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
              {specialties.map((spec) => (
                <label key={spec} className="flex items-center">
                  <input type="checkbox" value={spec} {...register('desiredSpecialties')} className="form-checkbox h-4 w-4 text-blue-600" />
                  <span className="ml-2 text-gray-700">{spec}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Location & Availability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Location <span className="text-red-500">*</span>
              </label>
              <select {...register('jobLocation')} className="w-full px-4 py-2 border rounded-lg">
                <option value="">Select</option>
                <option>New York</option>
                <option>London</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desired Availability <span className="text-red-500">*</span>
              </label>
              <select {...register('desiredAvailability')} className="w-full px-4 py-2 border rounded-lg">
                <option value="">Select</option>
                <option>Full-time</option>
                <option>Part-time</option>
              </select>
            </div>
          </div>

          {/* Salary & Establishment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proposed Salary <span className="text-red-500">*</span>
              </label>
              <select {...register('proposedSalary')} className="w-full px-4 py-2 border rounded-lg">
                <option value="">Select</option>
                <option>$50,000 - $60,000</option>
                <option>$60,000 - $70,000</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type of Establishment <span className="text-red-500">*</span>
              </label>
              <select {...register('establishmentType')} className="w-full px-4 py-2 border rounded-lg">
                <option value="">Select</option>
                <option>Restaurant</option>
                <option>Hotel</option>
              </select>
            </div>
          </div>

          {/* Vacancy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vacancy <span className="text-red-500">*</span>
            </label>
            <input
              {...register('vacancy', { required: true })}
              type="number"
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Vacancy"
            />
          </div>

          {/* With Accommodation */}
          <label className="flex items-center">
            <input type="checkbox" {...register('withAccommodation')} className="form-checkbox h-4 w-4 text-blue-600" />
            <span className="ml-2 text-gray-700">With Accommodation</span>
          </label>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="jobDescription"
              render={({ field }) => (
                <JoditEditor
                  ref={editorJobDescription}
                  value={field.value}
                  config={config}
                  onBlur={field.onChange}
                />
              )}
            />
          </div>
          {/* Job Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Requirements <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="jobDescription"
              render={({ field }) => (
                <JoditEditor
                  ref={editorJobDescription}
                  value={field.value}
                  config={config}
                  onBlur={field.onChange}
                />
              )}
            />
          </div>

          {/* Job Benefits */}
          <div className="mt-10">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Benefits <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="jobBenefits"
              render={({ field }) => (
                <JoditEditor
                  ref={editorJobBenefits}
                  value={field.value}
                  config={config}
                  onBlur={field.onChange}
                />
              )}
            />
          </div>

          {/* Visibility */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Offer Visibility <span className="text-red-500">*</span>
            </h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input {...register('offerVisibility')} type="radio" value="public" className="form-radio h-4 w-4 text-blue-600" />
                <span className="ml-2 text-gray-700">Public Name and Logo</span>
              </label>
              <label className="flex items-center">
                <input {...register('offerVisibility')} type="radio" value="anonymous" className="form-radio h-4 w-4 text-blue-600" />
                <span className="ml-2 text-gray-700">Anonymous</span>
              </label>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Deadline
            </label>
            <div className="relative">
              <input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                {...register('applicationDeadline')}
                className="w-full px-4 py-2 border rounded-lg pr-10"
              />
              <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
             <span className="text-[#6C727F] my-2">Optional - leave blank if no deadline</span>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
            Publish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
