'use client'

import { useState } from 'react'
import Link from 'next/link'
import { logPastoralVisitAction } from './actions'

export type PastoralDepartmentInfo = {
  id: string
  name: string
  description: string | null
  accent_color: string | null
}

export type PastoralMemberOption = {
  id: string
  member_code: string
  full_name: string
}

export type PastoralRecord = {
  id: string
  member_id: string
  full_name: string
  member_code: string
  visit_date: string
  visit_type: string
  assigned_pastor: string
  confidential_notes: string | null
  status: 'open' | 'needs_followup' | 'closed' | string
}

interface PastoralClientProps {
  deptInfo: PastoralDepartmentInfo
  members: PastoralMemberOption[]
  records: PastoralRecord[]
}

export default function PastoralClient({
  deptInfo,
  members,
  records,
}: PastoralClientProps) {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [activeNoteRecord, setActiveNoteRecord] = useState<PastoralRecord | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form state
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '')
  const [visitDate, setVisitDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [visitType, setVisitType] = useState('Home Visit')
  const [assignedPastor, setAssignedPastor] = useState('')
  const [confidentialNotes, setConfidentialNotes] = useState('')
  const [status, setStatus] = useState('open')

  const plumColor = deptInfo.accent_color || '#6B2A4A'

  const handleSubmitVisit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMemberId) {
      setErrorMsg('Please select a member.')
      return
    }
    if (!assignedPastor.trim()) {
      setErrorMsg('Please enter an assigned pastor or minister.')
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    try {
      await logPastoralVisitAction({
        member_id: selectedMemberId,
        visit_date: visitDate,
        visit_type: visitType,
        assigned_pastor: assignedPastor.trim(),
        confidential_notes: confidentialNotes.trim() || null,
        status,
      })
      setIsLogModalOpen(false)
      setConfidentialNotes('')
      setAssignedPastor('')
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to log pastoral visit.')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (st: string) => {
    const normalized = (st || '').toLowerCase()
    switch (normalized) {
      case 'needs_followup':
      case 'needs followup':
      case 'needs-followup':
        return 'bg-[#B85C50]/15 text-[#B85C50] border-[#B85C50]/30 font-semibold'
      case 'open':
        return 'bg-[#C99A3E]/15 text-[#C99A3E] border-[#C99A3E]/30 font-medium'
      case 'closed':
      default:
        return 'bg-[#6B8F71]/15 text-[#6B8F71] border-[#6B8F71]/30 font-medium'
    }
  }

  const formatStatusLabel = (st: string) => {
    const normalized = (st || '').toLowerCase()
    if (normalized.includes('followup')) return 'Needs Follow-up'
    if (normalized === 'open') return 'Open'
    if (normalized === 'closed') return 'Closed'
    return st
  }

  return (
    <div className="space-y-8">
      
      {/* Header Card with Plum Accent Bar */}
      <div className="bg-[#FFFFFF] border border-[#E7E5DE] rounded-[12px] overflow-hidden shadow-xs">
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: plumColor }}
        />
        <div className="p-6 sm:p-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: plumColor }}
              />
              <h1 className="font-serif text-3xl font-semibold text-[#1B2340]">
                {deptInfo.name || 'Pastoral Care'}
              </h1>
            </div>

            {/* SRS §22 Restricted Banner Pill */}
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#6B2A4A]/10 text-[#6B2A4A] border border-[#6B2A4A]/20">
              <svg
                className="w-3.5 h-3.5 mr-1.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Confidential — Restricted Access (SRS §22)
            </div>
          </div>

          <p className="text-sm text-[#4A5568] max-w-3xl leading-relaxed pl-6">
            {deptInfo.description ||
              'Pastoral visit logs, spiritual counseling tracking, bereavement care, and confidential follow-up management.'}
          </p>
        </div>
      </div>

      {/* Main Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#1B2340]">
              Pastoral Care Records
            </h2>
            <p className="text-xs text-[#4A5568] mt-0.5">
              Logs ordered by visit date. Clicking a member name opens their central profile.
            </p>
          </div>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="inline-flex items-center justify-center bg-[#C99A3E] hover:bg-[#b88c38] text-[#1B2340] font-medium text-xs px-4 py-2 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#C99A3E] focus:ring-offset-2 transition-colors shrink-0 shadow-xs"
          >
            + Log Visit
          </button>
        </div>

        <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5DE] overflow-hidden shadow-xs">
          {records.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#4A5568]">
              No pastoral care visits recorded yet. Click "+ Log Visit" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#1B2340]">
                <thead className="bg-[#FAF7F0] text-xs font-medium text-[#4A5568] border-b border-[#E7E5DE]">
                  <tr>
                    <th scope="col" className="px-5 py-3">Member</th>
                    <th scope="col" className="px-5 py-3">Visit Date</th>
                    <th scope="col" className="px-5 py-3">Visit Type</th>
                    <th scope="col" className="px-5 py-3">Assigned Pastor</th>
                    <th scope="col" className="px-5 py-3">Status</th>
                    <th scope="col" className="px-5 py-3 text-right">Confidential Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5DE]">
                  {records.map((r) => {
                    const dateStr = new Date(r.visit_date).toLocaleDateString(
                      'en-US',
                      { month: 'short', day: 'numeric', year: 'numeric' }
                    )

                    return (
                      <tr key={r.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                        {/* Member Link */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <Link
                            href={`/members/${r.member_id}`}
                            className="group inline-flex items-center space-x-2"
                          >
                            <span className="font-medium text-[#1B2340] group-hover:text-[#C99A3E] transition-colors">
                              {r.full_name}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FAF7F0] text-[#4A5568] border border-[#E7E5DE] tabular-nums">
                              {r.member_code}
                            </span>
                          </Link>
                        </td>

                        {/* Visit Date */}
                        <td className="px-5 py-3.5 whitespace-nowrap font-medium tabular-nums text-[#1B2340]">
                          {dateStr}
                        </td>

                        {/* Visit Type */}
                        <td className="px-5 py-3.5 whitespace-nowrap text-xs text-[#4A5568]">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#FAF7F0] border border-[#E7E5DE] font-medium text-[#1B2340]">
                            {r.visit_type}
                          </span>
                        </td>

                        {/* Assigned Pastor */}
                        <td className="px-5 py-3.5 whitespace-nowrap text-xs font-medium text-[#1B2340]">
                          {r.assigned_pastor}
                        </td>

                        {/* Status Pill */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${getStatusBadge(
                              r.status
                            )}`}
                          >
                            {formatStatusLabel(r.status)}
                          </span>
                        </td>

                        {/* Confidential Notes Truncated with Reveal */}
                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                          {r.confidential_notes ? (
                            <button
                              type="button"
                              onClick={() => setActiveNoteRecord(r)}
                              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-[6px] text-xs font-medium bg-[#6B2A4A]/10 text-[#6B2A4A] hover:bg-[#6B2A4A]/20 transition-colors"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              <span>View Note</span>
                            </button>
                          ) : (
                            <span className="text-xs text-[#4A5568]/50 italic">None</span>
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
      </div>

      {/* Reveal Confidential Note Modal */}
      {activeNoteRecord && (
        <div className="fixed inset-0 z-50 bg-[#1B2340]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5DE] rounded-[12px] max-w-lg w-full p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E5DE]">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6B2A4A]" />
                <h3 className="font-serif text-lg font-semibold text-[#1B2340]">
                  Confidential Pastoral Note
                </h3>
              </div>
              <button
                onClick={() => setActiveNoteRecord(null)}
                className="text-[#4A5568] hover:text-[#1B2340] text-sm font-medium"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#4A5568] bg-[#FAF7F0] p-3.5 rounded-[8px] border border-[#E7E5DE]">
              <div className="flex justify-between">
                <span>
                  <strong>Member:</strong> {activeNoteRecord.full_name} ({activeNoteRecord.member_code})
                </span>
                <span>
                  <strong>Date:</strong> {new Date(activeNoteRecord.visit_date).toLocaleDateString()}
                </span>
              </div>
              <div>
                <strong>Pastor / Minister:</strong> {activeNoteRecord.assigned_pastor}
              </div>
            </div>

            {/* Confidential Content */}
            <div className="p-4 bg-[#6B2A4A]/5 border border-[#6B2A4A]/20 rounded-[8px] text-sm text-[#1B2340] leading-relaxed space-y-2">
              <div className="text-[11px] font-semibold text-[#6B2A4A] uppercase tracking-wider flex items-center space-x-1">
                <span>🔒 Privileged Pastoral Information</span>
              </div>
              <p className="whitespace-pre-wrap">
                {activeNoteRecord.confidential_notes}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveNoteRecord(null)}
                className="bg-[#1B2340] text-[#FFFFFF] text-xs font-medium px-4 py-2 rounded-[8px] hover:bg-[#2a3660] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Pastoral Visit Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1B2340]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5DE] rounded-[12px] max-w-md w-full p-6 space-y-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E5DE]">
              <h3 className="font-serif text-lg font-semibold text-[#1B2340]">
                Log Pastoral Care Visit
              </h3>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="text-[#4A5568] hover:text-[#1B2340] text-sm font-medium"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-[#B85C50]/10 border border-[#B85C50]/30 rounded-[8px] text-xs text-[#B85C50]">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitVisit} className="space-y-4">
              {/* Member Selector */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#1B2340]">
                  Member <span className="text-[#B85C50]">*</span>
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] px-3 py-2 text-sm text-[#1B2340] focus:outline-none focus:ring-2 focus:ring-[#C99A3E]"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.member_code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Visit Date */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#1B2340]">
                  Visit Date
                </label>
                <input
                  type="date"
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] px-3 py-2 text-sm text-[#1B2340] focus:outline-none focus:ring-2 focus:ring-[#C99A3E]"
                />
              </div>

              {/* Visit Type */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#1B2340]">
                  Visit Type
                </label>
                <select
                  value={visitType}
                  onChange={(e) => setVisitType(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] px-3 py-2 text-sm text-[#1B2340] focus:outline-none focus:ring-2 focus:ring-[#C99A3E]"
                >
                  <option value="Home Visit">Home Visit</option>
                  <option value="Hospital Visit">Hospital Visit</option>
                  <option value="Bereavement Care">Bereavement Care</option>
                  <option value="Counseling Session">Counseling Session</option>
                  <option value="Routine Check-in">Routine Check-in</option>
                  <option value="Crisis Intervention">Crisis Intervention</option>
                </select>
              </div>

              {/* Assigned Pastor */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#1B2340]">
                  Assigned Pastor / Minister <span className="text-[#B85C50]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pastor James, Elder Sarah"
                  value={assignedPastor}
                  onChange={(e) => setAssignedPastor(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] px-3 py-2 text-sm text-[#1B2340] placeholder-[#4A5568]/40 focus:outline-none focus:ring-2 focus:ring-[#C99A3E]"
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#1B2340]">
                  Case Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] px-3 py-2 text-sm text-[#1B2340] focus:outline-none focus:ring-2 focus:ring-[#C99A3E]"
                >
                  <option value="open">Open (Active Case)</option>
                  <option value="needs_followup">Needs Follow-up</option>
                  <option value="closed">Closed (Resolved)</option>
                </select>
              </div>

              {/* Confidential Notes */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-[#1B2340]">
                    Confidential Notes
                  </label>
                  <span className="text-[10px] text-[#6B2A4A] font-medium">
                    Restricted §22
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={confidentialNotes}
                  onChange={(e) => setConfidentialNotes(e.target.value)}
                  placeholder="Privileged notes regarding spiritual care, prayer requests, or follow-up needs..."
                  className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] p-2.5 text-sm text-[#1B2340] placeholder-[#4A5568]/40 focus:outline-none focus:ring-2 focus:ring-[#6B2A4A]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-[#E7E5DE] flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="text-xs font-medium text-[#4A5568] hover:text-[#1B2340]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#C99A3E] hover:bg-[#b88c38] text-[#1B2340] font-medium text-xs px-4 py-2 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#C99A3E] disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}