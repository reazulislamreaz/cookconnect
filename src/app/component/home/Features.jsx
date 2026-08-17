import { ChefHat, Building2, Briefcase, Shield } from "lucide-react"
import Image from "next/image"
import icon1 from '../../../assets/hat-chef.png'
import icon2 from '../../../assets/image 3.png'
import icon3 from '../../../assets/image 4.png'
import icon4 from '../../../assets/image 5.png'

export default function Features() {
  const features = [
    {
    //   icon: ChefHat,
    icon:icon1,
      title: "Experienced Chefs",
      description: "Browse Profiles Of Skilled Chefs With Proven Experience In Real Kitchens.",
      iconColor: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
    //   icon: Building2,
    icon:icon2,
      title: "Restaurant Matching",
      description: "We Help Restaurants Find Chefs That Match Their Needs, Skills, And Style.",
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
    //   icon: Briefcase,
    icon:icon3,
      title: "Flexible Job Opportunities",
      description: "Whether You're Hiring Full-Time Or Just For A Shift — Find Or Post Jobs Easily.",
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
    //   icon: Shield,
    icon:icon4,
      title: "Secure And Easy-To-Use",
      description: "A Seamless Experience For Both Chefs And Restaurants, With Secure Logins And Smooth Communication.",
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
    },
  ]

  return (
   <div>
     <section className="py-16 px-4 bg-white relative">




      <div className="max-w-7xl mx-auto font-poppins">
        {/* Section Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">What Makes Us Different</h2>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
            >
                <div className="flex items-center gap-3 justify-center">

              {/* Icon */}
              <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                {/* <feature.icon className={`w-6 h-6 ${feature.iconColor}`} strokeWidth={2} /> */}
                <Image src={feature.icon} width={10} height={10} alt="" className="w-8" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                </div>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
   </div>
  )
}
