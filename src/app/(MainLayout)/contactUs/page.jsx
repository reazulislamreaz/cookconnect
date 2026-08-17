'use client';

import { useForm } from 'react-hook-form';
import { Mail, Phone } from 'lucide-react';
import ContactUsBanner from '../../component/Banner/ContactUsBanner';

export default function ContactForm() {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data) => {
    console.log('Form Data:', data);
    reset(); // Optional: reset form after submit
  };

  return (
   <div>
    <ContactUsBanner/>
     <section className=" flex justify-center py-8 ">
      <div className="w-full max-w-xl text-center">
        {/* Contact Info */}
        <div className="flex gap-7 items-center justify-center text-center text-gray-700 text-sm my-10 space-y-2">
<div>
          <div className="flex items-center space-x-2">
        <Mail className="w-4 h-4" />
        <span>Email:</span>
        <span>youremail@gmail.com</span>
      </div>
      <div className='ml-12'>
        <span>letstalk@gmail.com</span>
      </div>
</div>
<div>
          <div className="flex items-center space-x-2">
       <Phone className="w-4 h-4" />
        <span>Phone:</span>
        <span>(+1) (888) 750-6866</span>
      </div>
      <div className='ml-12'>
        <span>(+1) (888) 785-3986</span>
      </div>
</div>

    </div>

        {/* Heading */}
        <h2 className="text-2xl font-semibold text-gray-800">Get in Touch</h2>
        <p className="text-sm text-gray-500 mb-8">Contact with us</p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Subject</label>
            <input
              {...register('subject')}
              placeholder="Address"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-orange-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Opinions</label>
            <textarea
              {...register('opinion')}
              rows={5}
              placeholder="What can we help with?"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-orange-300 text-sm resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition"
          >
            Send
          </button>
        </form>
      </div>
    </section>
   </div>
  );
}
