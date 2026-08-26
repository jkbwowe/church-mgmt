'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { saveAttendanceAction } from './actions'

export type AttendanceMember = {
  id: string
  member_code: string
  full_name: string
  is_choir_member: boolean
}

export type ExistingAttendanceRecord = {
  member_id: string
  service_type: string
  attendance_date: string
}

export type AttendanceHistoryGroup = {
  attendance_date: string
  service_type: string
  present_count: number
  members: { id: string; full_name: string; member_code: string }[]
}

interface AttendanceClientProps {
  initialSundayDate: string
  members: AttendanceMember[]
  existingRecords: ExistingAttendanceRecord[]
  historyGroups: AttendanceHistoryGroup[]
}

export default function AttendanceClient({
  initialSundayDate,
  members,
  existingRecords,
  historyGroups,
}: AttendanceClientProps) {
  const [activeTab, setActiveTab] = useState<'record' | 'history'>('record')
  const [serviceType, setServiceType] = useState<string>('Sunday Service')
  const [selectedDate, setSelectedDate] = useState<string>(initialSundayDate)
  
  const [checkedMemberIds, setCheckedMemberIds] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Expanded dates state for History tab
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())

  // Filter members according to selected service type
  const activeMemberList = useMemo(() => {
    if (serviceType === 'Choir Rehearsal') {
      return members.filter((m) => m.is_choir_member)
    }
    return members
  }, [members, serviceType])

  // Synchronize checked status when date or serviceType changes
  useEffect(() => {
    const existingForSelection = existingRecords.filter(
      (r) =>
        r.service_type === serviceType &&
        r.attendance_date.startsWith(selectedDate)
    )

    const initialChecked = new Set<string>(
      existingForSelection.map((r) => r.member_id)
    )
    setCheckedMemberIds(initialChecked)
  }, [serviceType, selectedDate, existingRecords])

  const toggleMember = (memberId: string) => {
    const next = new Set(checkedMemberIds)
    if (next.has(memberId)) {
      next.delete(memberId)
    } else {
      next.add(memberId)
    }
    setCheckedMemberIds(next)
  }

  const handleSelectAll = () => {
    const allIds = activeMemberList.map((m) => m.id)
    setCheckedMemberIds(new Set(allIds))
  }

  const handleDeselectAll = () => {
    setCheckedMemberIds(new Set())
  }

  const handleSaveAttendance = async () => {
    setSaving(true)
    setToastMessage(null)

    try {
      await saveAttendanceAction({
        attendance_date: selectedDate,
        service_type: serviceType,
        present_member_ids: Array.from(checkedMemberIds),
      })
      setToastMessage(
        `Saved ${checkedMemberIds.size} attendance record(s) for ${serviceType} on ${selectedDate}.`
      )
      setTimeout(() => setToastMessage(null), 4000)
    } catch (err: any) {
      setToastMessage('Failed to save attendance records.')
    } finally {
      setSaving(false)
    }
  }

  const toggleHistoryExpand = (key: string) => {
    const next = new Set(expandedDates)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    setExpandedDates(next)
  }

  // Filter history list according to selected service type
  const filteredHistory = useMemo(() => {
    return historyGroups.filter((g) => g.service_type === serviceType)
  }, [historyGroups, serviceType])

  return (
    <div className="space-y-6">
      
      {/* Top Controls: Service Type & Date Picker */}
      <div className="bg-[#FFFFFF] border border-[#E7E5DE] rounded-[12px] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 max-w-2xl">
          
          {/* Service Type Filter */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#1B2340]">
              Service Type
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] px-3 py-2 text-sm text-[#1B2340] focus:outline-none focus:ring-2 focus:ring-[#C99A3E]"
            >
              <option value="Sunday Service">Sunday Service</option>
              <option value="Midweek">Midweek</option>
              <option value="Youth">Youth</option>
              <option value="Choir Rehearsal">Choir Rehearsal</option>
            </select>
          </div>

          {/* Date Picker */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#1B2340]">
              Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] px-3 py-2 text-sm text-[#1B2340] focus:outline-none focus:ring-2 focus:ring-[#C99A3E]"
            />
          </div>

        </div>

        {/* Tab Navigation Toggle */}
        <div className="inline-flex p-1 bg-[#FAF7F0] border border-[#E7E5DE] rounded-[8px] self-start sm:self-end">
          <button
            onClick={() => setActiveTab('record')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-[6px] transition-colors ${
              activeTab === 'record'
                ? 'bg-[#1B2340] text-[#FFFFFF] shadow-xs'
                : 'text-[#4A5568] hover:text-[#1B2340]'
            }`}
          >
            Record
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-[6px] transition-colors ${
              activeTab === 'history'
                ? 'bg-[#1B2340] text-[#FFFFFF] shadow-xs'
                : 'text-[#4A5568] hover:text-[#1B2340]'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {toastMessage && (
        <div className="p-3.5 bg-[#6B8F71]/15 border border-[#6B8F71]/30 rounded-[8px] text-xs font-medium text-[#1B2340] flex items-center justify-between">
          <span>✓ {toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#4A5568] hover:text-[#1B2340] ml-4 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Mode 1: Record Attendance Tab */}
      {activeTab === 'record' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] p-4 rounded-[12px] border border-[#E7E5DE]">
            <div>
              <p className="text-xs font-medium text-[#4A5568]">
                Marking present members for{' '}
                <strong className="text-[#1B2340]">{serviceType}</strong> on{' '}
                <strong className="text-[#1B2340]">{selectedDate}</strong>
              </p>
              <p className="text-[11px] text-[#4A5568]/70 mt-0.5">
                {checkedMemberIds.size} of {activeMemberList.length} member(s) selected
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-[#4A5568] hover:text-[#1B2340] underline font-medium"
              >
                Select All
              </button>
              <span className="text-[#E7E5DE]">|</span>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-xs text-[#4A5568] hover:text-[#1B2340] underline font-medium"
              >
                Deselect All
              </button>

              <button
                onClick={handleSaveAttendance}
                disabled={saving}
                className="bg-[#C99A3E] hover:bg-[#b88c38] text-[#1B2340] font-semibold text-xs px-4 py-2 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#C99A3E] disabled:opacity-50 transition-colors shadow-xs ml-2"
              >
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </div>

          {/* Member Checklist Table */}
          <div className="bg-[#FFFFFF] border border-[#E7E5DE] rounded-[12px] overflow-hidden shadow-xs">
            {activeMemberList.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#4A5568]">
                No eligible members found for {serviceType}.
              </div>
            ) : (
              <div className="divide-y divide-[#E7E5DE]">
                {activeMemberList.map((m) => {
                  const isChecked = checkedMemberIds.has(m.id)

                  return (
                    <label
                      key={m.id}
                      className={`flex items-center justify-between p-3.5 hover:bg-[#FAF7F0]/60 cursor-pointer transition-colors ${
                        isChecked ? 'bg-[#FAF7F0]/30' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleMember(m.id)}
                          className="w-4 h-4 rounded border-[#E7E5DE] text-[#C99A3E] focus:ring-[#C99A3E]"
                        />
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#FAF7F0] text-[#1B2340] border border-[#E7E5DE] tabular-nums">
                          {m.member_code}
                        </span>
                        <span className="text-sm font-medium text-[#1B2340]">
                          {m.full_name}
                        </span>
                      </div>

                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${
                          isChecked
                            ? 'bg-[#6B8F71]/15 text-[#6B8F71] border-[#6B8F71]/30'
                            : 'bg-[#4A5568]/10 text-[#4A5568] border-[#4A5568]/20'
                        }`}
                      >
                        {isChecked ? 'Present' : 'Absent'}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Attendance History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5DE] rounded-[12px] overflow-hidden shadow-xs">
            <div className="p-4 bg-[#FAF7F0] border-b border-[#E7E5DE]">
              <h2 className="font-serif text-base font-semibold text-[#1B2340]">
                Past Attendance Logs — {serviceType}
              </h2>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#4A5568]">
                No historical records logged for {serviceType} yet.
              </div>
            ) : (
              <div className="divide-y divide-[#E7E5DE]">
                {filteredHistory.map((group) => {
                  const key = `${group.attendance_date}-${group.service_type}`
                  const isExpanded = expandedDates.has(key)
                  const dateFormatted = new Date(
                    group.attendance_date
                  ).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })

                  return (
                    <div key={key} className="bg-[#FFFFFF]">
                      {/* Summary Row */}
                      <div
                        onClick={() => toggleHistoryExpand(key)}
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#FAF7F0]/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-semibold text-[#1B2340] tabular-nums">
                            {dateFormatted}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#FAF7F0] text-[#4A5568] border border-[#E7E5DE]">
                            {group.service_type}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#6B8F71]/15 text-[#6B8F71] border border-[#6B8F71]/30">
                            {group.present_count} present
                          </span>
                          <span className="text-xs text-[#4A5568] font-medium">
                            {isExpanded ? '▲ Hide' : '▼ Details'}
                          </span>
                        </div>
                      </div>

                      {/* Expandable Attendees List */}
                      {isExpanded && (
                        <div className="p-4 bg-[#FAF7F0]/40 border-t border-[#E7E5DE] space-y-2">
                          <p className="text-[11px] font-semibold text-[#4A5568] uppercase tracking-wider">
                            Attended Members ({group.members.length}):
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {group.members.map((m) => (
                              <Link
                                key={m.id}
                                href={`/members/${m.id}`}
                                className="flex items-center space-x-2 p-2 rounded-[6px] bg-[#FFFFFF] border border-[#E7E5DE] hover:border-[#C99A3E] transition-colors text-xs"
                              >
                                <span className="font-semibold text-[#1B2340] text-[11px] tabular-nums bg-[#FAF7F0] px-1.5 py-0.5 rounded border border-[#E7E5DE]">
                                  {m.member_code}
                                </span>
                                <span className="font-medium text-[#1B2340] truncate">
                                  {m.full_name}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}