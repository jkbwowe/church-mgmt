'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export type MemberWithDepartments = {
  id: string
  member_code: string
  full_name: string
  phone: string | null
  membership_status: string
  date_joined: string
  departments: {
    id: string
    name: string
    accent_color: string
  }[]
}

export default function MembersClient({
  initialMembers,
}: {
  initialMembers: MemberWithDepartments[]
}) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'new'>('all')

  // Filter members based on search input and status selector
  const filteredMembers = initialMembers.filter((member) => {
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !query ||
      member.full_name.toLowerCase().includes(query) ||
      member.member_code.toLowerCase().includes(query) ||
      (member.phone && member.phone.toLowerCase().includes(query))

    const matchesStatus =
      statusFilter === 'all' ||
      member.membership_status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Format status badge styles
  const getStatusBadge = (status: string) => {
    const normalized = status.toLowerCase()
    switch (normalized) {
      case 'active':
        return 'bg-[#6B8F71]/15 text-[#6B8F71] border-[#6B8F71]/30'
      case 'new':
        return 'bg-[#C99A3E]/15 text-[#C99A3E] border-[#C99A3E]/30'
      case 'inactive':
      default:
        return 'bg-[#4A5568]/15 text-[#4A5568] border-[#4A5568]/30'
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#1B2340]">
            Members
          </h1>
          <p className="text-xs text-[#4A5568] mt-0.5">
            Central membership directory ({initialMembers.length} total)
          </p>
        </div>

        {/* Add Member Button */}
        <Link
          href="/members/new"
          className="inline-flex items-center justify-center bg-[#C99A3E] text-[#1B2340] font-medium text-sm px-4 py-2 rounded-[8px] hover:bg-[#b88c38] focus:outline-none focus:ring-2 focus:ring-[#C99A3E] focus:ring-offset-2 transition-colors shrink-0"
        >
          + Add Member
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-4">
        <div className="w-full">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, member code (e.g. CH-000125), or phone..."
            className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] px-3.5 py-2 text-sm text-[#1B2340] placeholder-[#4A5568]/50 focus:outline-none focus:ring-2 focus:ring-[#C99A3E] focus:border-[#C99A3E] transition-all"
          />
        </div>

        {/* Status Filter Pill Toggles */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-[#4A5568] font-medium mr-1">Status:</span>
          {(['all', 'active', 'inactive', 'new'] as const).map((status) => {
            const isActive = statusFilter === status
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`capitalize px-3 py-1 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-[#C99A3E] ${
                  isActive
                    ? 'bg-[#1B2340] text-[#FFFFFF] border-[#1B2340] font-medium'
                    : 'bg-[#FFFFFF] text-[#4A5568] border-[#E7E5DE] hover:border-[#4A5568]'
                }`}
              >
                {status}
              </button>
            )
          })}
        </div>
      </div>

      {/* Members Table Card */}
      <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5DE] overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-[#4A5568]">
              {searchQuery
                ? `No members match '${searchQuery}'`
                : 'No members found in this status category.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#1B2340]">
              <thead className="bg-[#FAF7F0] text-xs font-medium text-[#4A5568] border-b border-[#E7E5DE]">
                <tr>
                  <th scope="col" className="px-5 py-3">Member ID</th>
                  <th scope="col" className="px-5 py-3">Full Name</th>
                  <th scope="col" className="px-5 py-3">Phone</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3">Departments</th>
                  <th scope="col" className="px-5 py-3">Date Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5DE]">
                {filteredMembers.map((member) => {
                  const dateJoined = member.date_joined
                    ? new Date(member.date_joined).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'

                  return (
                    <tr
                      key={member.id}
                      onClick={() => router.push(`/members/${member.id}`)}
                      className="hover:bg-[#FAF7F0]/60 cursor-pointer transition-colors"
                    >
                      {/* Member Code Badge */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-sans font-medium bg-[#FAF7F0] text-[#1B2340] border border-[#E7E5DE] tabular-nums tracking-[0.02em]">
                          {member.member_code}
                        </span>
                      </td>

                      {/* Full Name */}
                      <td className="px-5 py-3.5 font-medium text-[#1B2340] whitespace-nowrap">
                        {member.full_name}
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-3.5 text-[#4A5568] whitespace-nowrap tabular-nums">
                        {member.phone || '—'}
                      </td>

                      {/* Status Pill */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusBadge(
                            member.membership_status
                          )}`}
                        >
                          {member.membership_status}
                        </span>
                      </td>

                      {/* Department Accent Dots */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {member.departments && member.departments.length > 0 ? (
                          <div className="flex items-center space-x-1.5">
                            {member.departments.map((dept) => (
                              <span
                                key={dept.id}
                                title={dept.name}
                                className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                                style={{ backgroundColor: dept.accent_color || '#C99A3E' }}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-[#4A5568]/50">—</span>
                        )}
                      </td>

                      {/* Date Joined */}
                      <td className="px-5 py-3.5 text-[#4A5568] whitespace-nowrap tabular-nums">
                        {dateJoined}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}