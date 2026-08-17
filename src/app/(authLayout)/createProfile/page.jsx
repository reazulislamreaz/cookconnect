'use client';

import { useForm } from "react-hook-form";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function CreateProfilePage() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const [dishPreviews, setDishPreviews] = useState([]);
  const [submittedPhotos, setSubmittedPhotos] = useState([]);
  const [profilePreview, setProfilePreview] = useState(null);
  const [photoError, setPhotoError] = useState("");

  const dishPhotosFiles = watch("dishPhotos");
  const profilePictureFile = watch("profilePicture");
  const uploadCvFile = watch("uploadCv");
  const fileInputRef = useRef(null);

  const handleDishPhotoChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 8) {
      setPhotoError("You can only upload up to 8 photos.");
      setValue("dishPhotos", []);
      setDishPreviews([]);
    } else {
      setPhotoError("");
      setValue("dishPhotos", selectedFiles);
      const previews = selectedFiles.map((file) => URL.createObjectURL(file));
      setDishPreviews(previews);
    }
  };

  useEffect(() => {
    if (profilePictureFile && profilePictureFile[0]) {
      const file = profilePictureFile[0];
      const imageUrl = URL.createObjectURL(file);
      setProfilePreview(imageUrl);
      return () => URL.revokeObjectURL(imageUrl);
    } else {
      setProfilePreview(null);
    }
  }, [profilePictureFile]);
const router = useRouter()
  const onSubmit = (data) => {
    console.log("Form Data:", data);
    if (data.dishPhotos && data.dishPhotos.length > 0) {
      const postedImages = Array.from(data.dishPhotos).map((file) =>
        URL.createObjectURL(file)
      );
      setSubmittedPhotos(postedImages);
      setDishPreviews([]);
    }
    router.push('/dashboard')
  };

  const yearsOfExperienceOptions = ["2 years", "3 years", "4 years", "5+ years", "10+ years"];
  const cityOptions = ["Select your city", "New York", "Los Angeles", "Chicago", "London", "Paris"];
  const currentPositionOptions = ["Sous-Chef", "Head Chef", "Pastry Chef", "Line Cook", "Commis Chef"];
  const experienceLevelOptions = ["Sous-Chef", "Junior Chef", "Senior Chef", "Executive Chef"];
  const culinarySpecialties = [
    "Moroccan Cuisine", "Asian Cuisine", "Italian Cuisine", "Fast Food",
    "French Cuisine", "Grills", "Seafood", "International Cuisine",
    "Pastry Shop", "Bakery", "Vegetarian Cuisine"
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-poppins">
      <div className="bg-white border border-[#B5B5B5] rounded-lg shadow-lg p-6 sm:p-8 lg:p-10 max-w-5xl w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Info */}
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Profile Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full name<span className="text-red-500">*</span>
            </label>
            <input
              {...register("fullName", { required: "Full name is required" })}
              type="text"
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
            )}
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years of experience<span className="text-red-500">*</span>
            </label>
            <select
              {...register("yearsOfExperience", { required: "Required" })}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-white"
            >
              <option value="">Select</option>
              {yearsOfExperienceOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {errors.yearsOfExperience && (
              <p className="text-red-500 text-sm mt-1">{errors.yearsOfExperience.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone number<span className="text-red-500">*</span>
            </label>
            <input
              {...register("phoneNumber", { required: "Phone number is required" })}
              type="tel"
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
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
              {...register("city", { required: "City is required" })}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-white"
            >
              {cityOptions.map((city) => (
                <option key={city} value={city === "Select your city" ? "" : city}>
                  {city}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
            )}
          </div>

          {/* Current Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Position<span className="text-red-500">*</span>
            </label>
            <select
              {...register("currentPosition", { required: "Required" })}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-white"
            >
              {currentPositionOptions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
            {errors.currentPosition && (
              <p className="text-red-500 text-sm mt-1">{errors.currentPosition.message}</p>
            )}
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Experience Level<span className="text-red-500">*</span>
            </label>
            <select
              {...register("experienceLevel", { required: "Required" })}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-white"
            >
              {experienceLevelOptions.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            {errors.experienceLevel && (
              <p className="text-red-500 text-sm mt-1">{errors.experienceLevel.message}</p>
            )}
          </div>
        </div>

  
          {/* Culinary Specialties */}
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-8">Culinary Specialties</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {culinarySpecialties.map((item) => (
              <label key={item} className="flex items-center text-sm gap-2">
                <input type="checkbox" value={item} {...register("culinarySpecialties")} />
                {item}
              </label>
            ))}
          </div>

          {/* Profile Picture Upload */}
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-8">Profile Picture</h2>
          <div className="flex items-center space-x-4">
            <label htmlFor="profilePicture" className="cursor-pointer bg-[#F0F6FE] text-[#2A64C5] px-4 py-2 rounded-md text-sm font-medium">Choose File</label>
            <input type="file" id="profilePicture" {...register("profilePicture")} className="sr-only" />
            <span className="text-sm text-gray-500">{profilePictureFile?.[0]?.name || "No File Chosen"}</span>
          </div>

          {/* Upload CV */}
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-8">Upload CV</h2>
          <div className="flex items-center space-x-4">
            <label htmlFor="uploadCv" className="cursor-pointer bg-[#EFFCF5] text-[#347659] px-4 py-2 rounded-md text-sm font-medium">Choose File</label>
            <input type="file" id="uploadCv" {...register("uploadCv")} className="sr-only" />
            <span className="text-sm text-gray-500">{uploadCvFile?.[0]?.name || "No File Chosen"}</span>
          </div>

          {/* Dish Photos */}
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-8">Photos of your dishes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(submittedPhotos.length > 0 ? submittedPhotos : dishPreviews).map((src, index) => (
              <div key={index} className="aspect-square rounded-md overflow-hidden border border-gray-300 relative">
                <Image src={src} alt={`Dish ${index + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>

          {submittedPhotos.length === 0 && (
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-4">
                <label htmlFor="dishPhotos" className="cursor-pointer bg-[#FEFBED] text-[#AE5924] px-4 py-2 rounded-md text-sm font-medium">Choose File</label>
                <input type="file" id="dishPhotos" ref={fileInputRef} multiple disabled={dishPreviews.length >= 8} onChange={handleDishPhotoChange} className="sr-only" />
                <span className="text-sm text-gray-500">
                  {dishPreviews.length > 0 ? `${dishPreviews.length} file(s) chosen` : "No File Chosen"}
                </span>
              </div>
              {photoError && <p className="text-red-500 text-sm">{photoError}</p>}
              <p className="text-xs text-gray-500">You can add up to 8 photo(s)</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-orange-600">
              Save Change
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
