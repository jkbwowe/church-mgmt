'use client'

import { useState } from 'react'
import Link from 'next/link'

export type DepartmentWithCount = {
  id: string
  name: string
  slug: string
  description: string | null
  accent_color: string | null
  member_count: number
}

export default function DepartmentsClient({
  departments,
}: {
  departments: DepartmentWithCount[]
}) {
  const [comingSoonDept, setComingSoonDept] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      
      {/* Coming Soon Notification Banner */}
      {comingSoonDept && (
        <div className="bg-[#FAF7F0] border border-[#C99A3E]/40 rounded-[10px] p-4 flex items-center justify-between text-xs text-[#1B2340] shadow-xs">
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-[#C99A3E] animate-pulse" />
            <p>
              <span className="font-semibold">{comingSoonDept}</span> module is currently under development and coming soon.
            </p>
          </div>
          <button
            onClick={() => setComingSoonDept(null)}
            className="text-[#4A5568] hover:text-[#1B2340] font-medium text-xs ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const accentColor = dept.accent_color || '#C99A3E'
          const isDedicated =
            dept.slug === 'choir' ||
            dept.slug === 'pastoral' ||
            dept.slug === 'pastoral-care' ||
            dept.name.toLowerCase().includes('choir') ||
            dept.name.toLowerCase().includes('pastoral')

          // Dedicated route mapping
          const destinationRoute = dept.slug.includes('pastoral')
            ? '/departments/pastoral'
            : dept.slug.includes('choir')
            ? '/departments/choir'
            : `/departments/${dept.slug}`

          return (
            <div
              key={dept.id}
              className="bg-[#FFFFFF] border border-[#E7E5DE] rounded-[12px] overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
            >
              <div>
                {/* 4px Accent Color Top Bar */}
                <div
                  className="h-1 w-full"
                  style={{ backgroundColor: accentColor }}
                />

                <div className="p-6 space-y-4">
                  {/* Department Name (Section-level Fraunces scale) */}
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-serif text-xl font-semibold text-[#1B2340]">
                      {dept.name}
                    </h2>
                    
                    {/* Member Count Pill */}
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAF7F0] text-[#1B2340] border border-[#E7E5DE] shrink-0 tabular-nums">
                      <span
                        className="w-1.5 h-1.5 rounded-full mr-1.5"
                        style={{ backgroundColor: accentColor }}
                      />
                      {dept.member_count} {dept.member_count === 1 ? 'member' : 'members'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[#4A5568] leading-relaxed line-clamp-3">
                    {dept.description || 'No description available for this department.'}
                  </p>
                </div>
              </div>

              {/* Card Footer Link/Button */}
              <div className="px-6 py-4 bg-[#FAF7F0]/40 border-t border-[#E7E5DE] flex items-center justify-between">
                <span className="text-xs text-[#4A5568]">
                  {isDedicated ? 'Active Module' : 'Standard Department'}
                </span>

                {isDedicated ? (
                  <Link
                    href={destinationRoute}
                    className="inline-flex items-center text-xs font-semibold text-[#1B2340] hover:text-[#C99A3E] transition-colors"
                  >
                    View department <span className="ml-1">→</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setComingSoonDept(dept.name)}
                    className="inline-flex items-center text-xs font-semibold text-[#4A5568] hover:text-[#1B2340] transition-colors"
                  >
                    View department <span className="ml-1">→</span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}