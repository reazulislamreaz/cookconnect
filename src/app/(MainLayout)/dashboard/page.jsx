"use client"

import { Card, Progress, Button } from "antd"
import { User, Pencil, Eye, Search, Lock, Users, Briefcase, Award } from "lucide-react"

import DashboardCard from "../../component/dashboard/DashboardCard"
import ApplicationCard from "../../component/dashboard/ApplicationCard"
import Link from "next/link"

export const dashboardStats = [
  {
    id: 1,
    icon: <Users className="h-8 w-8 text-blue-500" />,
    percentage: "85%",
    label: "Complete Profile",
    bgColor: "bg-blue-50",
  },
  {
    id: 2,
    icon: <Eye className="h-8 w-8 text-green-500" />,
    percentage: "85%",
    label: "Profile Views",
    bgColor: "bg-green-50",
  },
  {
    id: 3,
    icon: <Briefcase className="h-8 w-8 text-orange-500" />,
    percentage: "85%",
    label: "Applications",
    bgColor: "bg-orange-50",
  },
  {
    id: 4,
    icon: <Award className="h-8 w-8 text-lime-500" />,
    percentage: "85%",
    label: "Profile Status",
    bgColor: "bg-lime-50",
  },
]

export const applications = [
  {
    id: 1,
    title: "Chef specializing in Moroccan cuisine",
    company: "The King's Table",
    appliedDate: "01/25/2024",
  },
  {
    id: 2,
    title: "Chef specializing in Moroccan cuisine",
    company: "The King's Table",
    appliedDate: "01/25/2024",
  },
  {
    id: 3,
    title: "Pastry Chef for French desserts",
    company: "Sweet Delights Bakery",
    appliedDate: "02/10/2024",
  },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 font-poppins">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">Hello ahmed benjelloun.com!</h1>
        <p className="mt-2 text-gray-600">Manage your profile and track your applications</p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((stat) => (
            <DashboardCard
              key={stat.id}
              icon={stat.icon}
              percentage={stat.percentage}
              label={stat.label}
              iconColor={stat.iconColor}
              bgColor={stat.bgColor}
            />
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <Card title={<span className="flex items-center space-x-2"><User className="h-5 w-5 text-gray-700" /><span>My Profile</span></span>} bordered>
              <p className="text-sm text-gray-600">Complete Profile</p>
              <Progress percent={85} showInfo={false} className="mt-2" />
              <div className="mt-4 flex items-center text-sm text-green-600">
                <Award className="mr-1 h-4 w-4" />
                <span>Verified Profile</span>
              </div>
              <div className="mt-6 space-y-3">
                   <Link href={'/editProfile'}>
                <Button block icon={<Pencil className="h-4 w-4 my-3" />} className="text-left">
                  Edit my profiles
                </Button>
                   </Link>
                <Link href={'/jobProfile/1'}>
                
                <Button block icon={<Eye className="h-4 w-4" />} className="text-left">
                  View my public profile
                </Button>
                </Link>
              </div>
            </Card>

            <Card title={<span className="flex items-center space-x-2"><User className="h-5 w-5 text-gray-700" /><span>Quick Actions</span></span>} bordered>
              <div className="space-y-3">
                   <Link href={'/jobProfile'}>
                   
                <Button block icon={<Eye className="h-4 w-4 my-3" />} className="text-left">
                  View profiles
                </Button>
                   </Link>
                      <Link href={'/allJobs'}>
                <Button block icon={<Search className="h-4 w-4" />} className="text-left">
                  Search for offers
                </Button>
                      </Link>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card
              title={
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-gray-700" />
                  <span className="font-semibold text-lg">My Applications</span>
                </div>
              }
              extra={
                   <Link href={'/allJobs'}>

                <Button className="text-gray-600 hover:text-gray-800 text-sm">
                  See all offers
                </Button>
                   </Link>
              }
              bordered
            >
              <div className="space-y-4">
                {applications.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    title={app.title}
                    company={app.company}
                    appliedDate={app.appliedDate}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
