"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pageNumbers = []
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i)
  }

  const baseBtn =
    "h-8 w-8 rounded-md text-sm font-medium transition-colors duration-150 flex items-center justify-center"
  const activeBtn = "bg-orange-500 text-white hover:bg-orange-600"
  const inactiveBtn = "bg-white text-gray-700 hover:bg-gray-100"
  const disabledBtn = "bg-white text-gray-400 cursor-not-allowed"

  const renderPageNumbers = () => {
    const maxPagesToShow = 7
    const pages = []

    if (totalPages <= maxPagesToShow) {
      return pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`${baseBtn} ${currentPage === number ? activeBtn : inactiveBtn}`}
        >
          {number}
        </button>
      ))
    }

    pages.push(
      <button
        key={1}
        onClick={() => onPageChange(1)}
        className={`${baseBtn} ${currentPage === 1 ? activeBtn : inactiveBtn}`}
      >
        1
      </button>,
    )

    const startPage = Math.max(2, currentPage - Math.floor((maxPagesToShow - 3) / 2))
    const endPage = Math.min(totalPages - 1, currentPage + Math.ceil((maxPagesToShow - 3) / 2))

    if (startPage > 2) {
      pages.push(
        <button key="ellipsis-start" disabled className={`${baseBtn} ${disabledBtn}`}>
          ...
        </button>,
      )
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`${baseBtn} ${currentPage === i ? activeBtn : inactiveBtn}`}
        >
          {i}
        </button>,
      )
    }

    if (endPage < totalPages - 1) {
      pages.push(
        <button key="ellipsis-end" disabled className={`${baseBtn} ${disabledBtn}`}>
          ...
        </button>,
      )
    }

    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className={`${baseBtn} ${currentPage === totalPages ? activeBtn : inactiveBtn}`}
        >
          {totalPages}
        </button>,
      )
    }

    return pages
  }

  return (
    <div className="flex items-right justify-end space-x-2 mt-8 font-poppins">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${baseBtn} ${currentPage === 1 ? disabledBtn : inactiveBtn}`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {renderPageNumbers()}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${baseBtn} ${currentPage === totalPages ? disabledBtn : inactiveBtn}`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
