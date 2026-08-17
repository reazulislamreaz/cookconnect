import { Users, Briefcase, Star } from "lucide-react"

export default function Stats() {
  const stats = [
    {
      icon: Users,
      number: "500+",
      description: "Registered cooks",
      iconColor: "text-blue-500",
    },
    {
      icon: Briefcase,
      number: "150+",
      description: "Partner restaurants",
      iconColor: "text-emerald-500",
    },
    {
      icon: Star,
      number: "95%",
      description: "Satisfaction rate",
      iconColor: "text-amber-500",
    },
  ]

  return (
<div>
        <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4">
                <stat.icon className={`w-12 h-12 md:w-16 md:h-16 ${stat.iconColor}`} strokeWidth={1.5} />
              </div>
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-sm md:text-base text-gray-600 font-medium">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
</div>
  )
}
