
export default function DashboardCard({ icon, percentage, label, bgColor }) {
  return (
    <div className="bg-white rounded-md flex flex-col items-center justify-center text-center p-6 font-poppins">
      <div className={`rounded-full p-3 ${bgColor}`}>
        {icon}
      </div>
      <div className="mt-4 text-2xl font-bold">{percentage}</div>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}
