"use client"

import Link from "next/link"
import React, { useState } from "react"

const initialNotifications = [
  {
    id: 1,
    title: "A new Product is added",
    message: "Product name, Brand name, Price $1070,000 is added in our collection!",
    time: "20-Dec-2024, 3:00 PM",
    isRead: false,
  },
  {
    id: 2,
    title: "A new Product is added",
    message: "Product name, Brand name, Price $1070,000 is added in our collection!",
    time: "20-Dec-2024, 3:00 PM",
    isRead: false,
  },
  {
    id: 3,
    title: "A new Product is added",
    message: "Product name, Brand name, Price $1070,000 is added in our collection!",
    time: "20-Dec-2024, 3:00 PM",
    isRead: true,
  },
  {
    id: 4,
    title: "A new Product is added",
    message: "Product name, Brand name, Price $1070,000 is added in our collection!",
    time: "20-Dec-2024, 3:00 PM",
    isRead: true,
  },
  {
    id: 5,
    title: "A new Product is added",
    message: "Product name, Brand name, Price $1070,000 is added in our collection!",
    time: "20-Dec-2024, 3:00 PM",
    isRead: true,
  },
]

const NotificationPage = () => {
  const [notifications, setNotifications] = useState(initialNotifications)

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 font-poppins">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Notifications</h2>
        <button
          onClick={markAllAsRead}
          className="text-sm text-blue-600 hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => handleMarkAsRead(notif.id)}
            className={`rounded-lg p-4 flex justify-between items-start shadow-sm cursor-pointer transition hover:shadow-md ${
              notif.isRead ? "bg-white" : "bg-[#E8EFE3]"
            }`}
          >
            <Link href={`/notification/${notif.id}`} className="flex-grow">
              <div>
                <p className="font-semibold text-gray-800">{notif.title}</p>
                <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
              </div>
            </Link>
            <span className="text-sm text-gray-500 whitespace-nowrap pl-4">
              {notif.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NotificationPage
