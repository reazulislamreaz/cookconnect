import React from 'react';

const AboutUsBanner = () => {
    return (
            <div>
            <section className="bg-[#F0F4EC] py-10 px-4 font-poppins">
                <div className="max-w-5xl mx-auto text-center">

                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-semibold text-[#5B913B] mb-2">
                        About Us
                    </h1>

                    {/* Subtitle */}
                    <p className="text-sm md:text-base text-[#5B913B] mb-6">
                        Discover the latest opportunities in catering
                    </p>


                </div>
            </section>
        </div>
    );
};

export default AboutUsBanner;