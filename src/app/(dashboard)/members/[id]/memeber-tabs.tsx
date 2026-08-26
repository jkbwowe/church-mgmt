'use client'

import { useState } from 'react'

export type DepartmentMembership = {
  id: string
  department_id: string
  department_name: string
  department_slug: string
  accent_color: string
  role_in_department: string | null
  date_assigned: string
}

export type ChoirRecord = {
  id: string
  rehearsal_date: string
  voice_part: string
  attended: boolean
  notes: string | null
}

export type PastoralRecord = {
  id: string
  visit_date: string
  visit_type: string
  assigned_pastor: string
  confidential_notes: string | null
  status: string
}

export type AttendanceRecord = {
  id: string
  service_type: string
  service_date: string
  present: boolean
}

interface MemberTabsProps {
  departments: DepartmentMembership[]
  choirRecords: ChoirRecord[]
  pastoralRecords: PastoralRecord[]
  attendanceRecords: AttendanceRecord[]
}

export default function MemberTabs({
  departments,
  choirRecords,
  pastoralRecords,
  attendanceRecords,
}: MemberTabsProps) {
  // Determine available tabs
  const hasChoir = departments.some(
    (d) => d.department_slug === 'choir' || d.department_name.toLowerCase().includes('choir')
  ) || choirRecords.length > 0

  const hasPastoral = departments.some(
    (d) => d.department_slug === 'pastoral' || d.department_name.toLowerCase().includes('pastoral')
  ) || pastoralRecords.length > 0

  // Standard tabs setup
  type TabKey = 'attendance' | 'choir' | 'pastoral' | string

  const initialTab: TabKey = departments.length > 0 
    ? (hasChoir ? 'choir' : hasPastoral ? 'pastoral' : departments[0].department_slug) 
    : 'attendance'

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab)

  return (
    <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5DE] overflow-hidden">
      
      {/* Zero Departments Warning Banner */}
      {departments.length === 0 && (
        <div className="bg-[#FAF7F0] border-b border-[#E7E5DE] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-[#B85C50]" />
            <p className="text-sm font-medium text-[#1B2340]">
              Not yet assigned to a department
            </p>
          </div>
          <button
            type="button"
            className="text-xs font-medium text-[#1B2340] bg-[#FFFFFF] border border-[#E7E5DE] hover:border-[#C99A3E] px-3 py-1.5 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C99A3E] transition-colors"
          >
            + Assign Department
          </button>
        </div>
      )}

      {/* Navigation Tab Bar */}
      <div className="border-b border-[#E7E5DE] bg-[#FAF7F0]/40 px-6 flex items-center space-x-6 overflow-x-auto">
        {/* Attendance Tab (Always present) */}
        <button
          onClick={() => setActiveTab('attendance')}
          className={`py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#C99A3E] focus:ring-offset-2 ${
            activeTab === 'attendance'
              ? 'border-[#1B2340] text-[#1B2340] font-semibold'
              : 'border-transparent text-[#4A5568] hover:text-[#1B2340]'
          }`}
        >
          Attendance Log ({attendanceRecords.length})
        </button>

        {/* Choir Tab */}
        {hasChoir && (
          <button
            onClick={() => setActiveTab('choir')}
            className={`py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-[#C99A3E] focus:ring-offset-2 ${
              activeTab === 'choir'
                ? 'border-[#1B2340] text-[#1B2340] font-semibold'
                : 'border-transparent text-[#4A5568] hover:text-[#1B2340]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#C99A3E]" />
            <span>Choir Records ({choirRecords.length})</span>
          </button>
        )}

        {/* Pastoral Tab */}
        {hasPastoral && (
          <button
            onClick={() => setActiveTab('pastoral')}
            className={`py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-[#C99A3E] focus:ring-offset-2 ${
              activeTab === 'pastoral'
                ? 'border-[#1B2340] text-[#1B2340] font-semibold'
                : 'border-transparent text-[#4A5568] hover:text-[#1B2340]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#6B5B95]" />
            <span>Pastoral Care ({pastoralRecords.length})</span>
          </button>
        )}

        {/* Generic Department Tabs */}
        {departments
          .filter(
            (d) =>
              d.department_slug !== 'choir' &&
              d.department_slug !== 'pastoral' &&
              !d.department_name.toLowerCase().includes('choir') &&
              !d.department_name.toLowerCase().includes('pastoral')
          )
          .map((dept) => (
            <button
              key={dept.id}
              onClick={() => setActiveTab(dept.department_slug)}
              className={`py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-[#C99A3E] focus:ring-offset-2 ${
                activeTab === dept.department_slug
                  ? 'border-[#1B2340] text-[#1B2340] font-semibold'
                  : 'border-transparent text-[#4A5568] hover:text-[#1B2340]'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: dept.accent_color || '#C99A3E' }}
              />
              <span>{dept.department_name}</span>
            </button>
          ))}
      </div>

      {/* Tab Panels */}
      <div className="p-6">
        
        {/* Attendance Tab Content */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-medium text-[#1B2340]">
                Attendance History
              </h3>
              <span className="text-xs text-[#4A5568]">Most recent first</span>
            </div>

            {attendanceRecords.length === 0 ? (
              <p className="text-sm text-[#4A5568] py-8 text-center">
                No attendance records found for this member.
              </p>
            ) : (
              <div className="overflow-x-auto border border-[#E7E5DE] rounded-[8px]">
                <table className="w-full text-left text-sm text-[#1B2340]">
                  <thead className="bg-[#FAF7F0] text-xs font-medium text-[#4A5568] border-b border-[#E7E5DE]">
                    <tr>
                      <th scope="col" className="px-4 py-3">Service Date</th>
                      <th scope="col" className="px-4 py-3">Service Type</th>
                      <th scope="col" className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E5DE]">
                    {attendanceRecords.map((record) => {
                      const dateStr = new Date(record.service_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                      return (
                        <tr key={record.id} className="hover:bg-[#FAF7F0]/40">
                          <td className="px-4 py-3 tabular-nums text-[#1B2340] font-medium">
                            {dateStr}
                          </td>
                          <td className="px-4 py-3 text-[#4A5568]">
                            {record.service_type || 'Sunday Service'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {record.present ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#6B8F71]/15 text-[#6B8F71] border border-[#6B8F71]/30">
                                ✓ Present
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#B85C50]/15 text-[#B85C50] border border-[#B85C50]/30">
                                ✕ Absent
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Choir Tab Content */}
        {activeTab === 'choir' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#1B2340]">
                  Choir Rehearsal & Performance Records
                </h3>
                <p className="text-xs text-[#4A5568]">Voice Part & Attendance Log</p>
              </div>
            </div>

            {choirRecords.length === 0 ? (
              <p className="text-sm text-[#4A5568] py-8 text-center">
                No choir rehearsal logs recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto border border-[#E7E5DE] rounded-[8px]">
                <table className="w-full text-left text-sm text-[#1B2340]">
                  <thead className="bg-[#FAF7F0] text-xs font-medium text-[#4A5568] border-b border-[#E7E5DE]">
                    <tr>
                      <th scope="col" className="px-4 py-3">Rehearsal Date</th>
                      <th scope="col" className="px-4 py-3">Voice Part</th>
                      <th scope="col" className="px-4 py-3">Attended</th>
                      <th scope="col" className="px-4 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E5DE]">
                    {choirRecords.map((record) => {
                      const dateStr = new Date(record.rehearsal_date).toLocaleDateString(
                        'en-US',
                        { month: 'short', day: 'numeric', year: 'numeric' }
                      )
                      return (
                        <tr key={record.id} className="hover:bg-[#FAF7F0]/40">
                          <td className="px-4 py-3 tabular-nums font-medium text-[#1B2340]">
                            {dateStr}
                          </td>
                          <td className="px-4 py-3 font-medium text-[#C99A3E]">
                            {record.voice_part}
                          </td>
                          <td className="px-4 py-3">
                            {record.attended ? (
                              <span className="text-[#6B8F71] font-semibold text-xs">✓ Attended</span>
                            ) : (
                              <span className="text-[#B85C50] font-semibold text-xs">✕ Absent</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-[#4A5568]">
                            {record.notes || '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pastoral Tab Content (Confidential Indicator) */}
        {activeTab === 'pastoral' && (
          <div className="space-y-4 border-l-4 border-[#6B5B95] pl-4 py-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h3 className="font-serif text-lg font-medium text-[#1B2340]">
                  Pastoral Care Records
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#6B5B95]/15 text-[#6B5B95] border border-[#6B5B95]/30">
                  Confidential
                </span>
              </div>
            </div>

            {pastoralRecords.length === 0 ? (
              <p className="text-sm text-[#4A5568] py-8 text-center">
                No pastoral visit records logged.
              </p>
            ) : (
              <div className="overflow-x-auto border border-[#E7E5DE] rounded-[8px]">
                <table className="w-full text-left text-sm text-[#1B2340]">
                  <thead className="bg-[#FAF7F0] text-xs font-medium text-[#4A5568] border-b border-[#E7E5DE]">
                    <tr>
                      <th scope="col" className="px-4 py-3">Visit Date</th>
                      <th scope="col" className="px-4 py-3">Visit Type</th>
                      <th scope="col" className="px-4 py-3">Assigned Pastor</th>
                      <th scope="col" className="px-4 py-3">Status</th>
                      <th scope="col" className="px-4 py-3">Confidential Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E5DE]">
                    {pastoralRecords.map((record) => {
                      const dateStr = new Date(record.visit_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                      return (
                        <tr key={record.id} className="hover:bg-[#FAF7F0]/40">
                          <td className="px-4 py-3 tabular-nums font-medium text-[#1B2340]">
                            {dateStr}
                          </td>
                          <td className="px-4 py-3 text-[#1B2340]">
                            {record.visit_type}
                          </td>
                          <td className="px-4 py-3 text-[#4A5568]">
                            {record.assigned_pastor}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-[#6B5B95]/10 text-[#6B5B95] border border-[#6B5B95]/20 capitalize">
                              {record.status ? record.status.replace('_', ' ') : 'Completed'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-[#4A5568] italic max-w-xs leading-relaxed">
                            {record.confidential_notes || '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Other Generic Department Tabs */}
        {departments
          .filter(
            (d) =>
              d.department_slug !== 'choir' &&
              d.department_slug !== 'pastoral' &&
              !d.department_name.toLowerCase().includes('choir') &&
              !d.department_name.toLowerCase().includes('pastoral')
          )
          .map((dept) => {
            if (activeTab !== dept.department_slug) return null
            return (
              <div key={dept.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-medium text-[#1B2340]">
                    {dept.department_name} Department Detail
                  </h3>
                  <span className="text-xs text-[#4A5568]">
                    Assigned: {new Date(dept.date_assigned).toLocaleDateString()}
                  </span>
                </div>
                <div className="p-4 bg-[#FAF7F0] rounded-[8px] border border-[#E7E5DE]">
                  <p className="text-sm text-[#1B2340]">
                    <span className="font-medium">Assigned Role:</span>{' '}
                    {dept.role_in_department || 'Member'}
                  </p>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}