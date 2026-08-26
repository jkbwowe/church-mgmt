'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { logRehearsalAction } from './actions'

export type ChoirDepartmentInfo = {
  id: string
  name: string
  description: string | null
  accent_color: string | null
}

export type ChoirMember = {
  id: string
  member_code: string
  full_name: string
  membership_status: string
  voice_part: string
}

export type ChoirRehearsal = {
  id: string
  member_id: string
  full_name: string
  member_code: string
  rehearsal_date: string
  voice_part: string
  attended: boolean
  notes: string | null
}

interface ChoirClientProps {
  deptInfo: ChoirDepartmentInfo
  members: ChoirMember[]
  rehearsals: ChoirRehearsal[]
}

export default function ChoirClient({
  deptInfo,
  members,
  rehearsals,
}: ChoirClientProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form State for logging rehearsal
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '')
  const [rehearsalDate, setRehearsalDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [voicePart, setVoicePart] = useState('Soprano')
  const [attended, setAttended] = useState(true)
  const [notes, setNotes] = useState('')

  const accentColor = deptInfo.accent_color || '#C99A3E'

  // Sync default voice part when selecting a member in modal
  const handleMemberChange = (memberId: string) => {
    setSelectedMemberId(memberId)
    const m = members.find((x) => x.id === memberId)
    if (m && m.voice_part) {
      setVoicePart(m.voice_part)
    }
  }

  const handleSubmitRehearsal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMemberId) {
      setErrorMsg('Please select a choir member.')
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    try {
      await logRehearsalAction({
        member_id: selectedMemberId,
        rehearsal_date: rehearsalDate,
        voice_part: voicePart,
        attended,
        notes: notes.trim() || null,
      })
      setIsModalOpen(false)
      setNotes('')
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to log rehearsal attendance.')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const normalized = (status || '').toLowerCase()
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
    <div className="space-y-8">
      
      {/* Header Card with Accent Bar */}
      <div className="bg-[#FFFFFF] border border-[#E7E5DE] rounded-[12px] overflow-hidden shadow-xs">
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: accentColor }}
        />
        <div className="p-6 sm:p-8 space-y-2">
          <div className="flex items-center space-x-3">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: accentColor }}
            />
            <h1 className="font-serif text-3xl font-semibold text-[#1B2340]">
              {deptInfo.name || 'Choir & Music'}
            </h1>
          </div>
          <p className="text-sm text-[#4A5568] max-w-3xl leading-relaxed pl-6">
            {deptInfo.description ||
              'Department workflow for rehearsal logging, vocal section organization, and choir attendance tracking.'}
          </p>
        </div>
      </div>

      {/* Section 1: Assigned Choir Members */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#1B2340]">
              Choir Roster
            </h2>
            <p className="text-xs text-[#4A5568] mt-0.5">
              Assigned members ({members.length}). Clicking a row navigates to their central profile.
            </p>
          </div>
        </div>

        <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5DE] overflow-hidden shadow-xs">
          {members.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#4A5568]">
              No members are currently assigned to the Choir department.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#1B2340]">
                <thead className="bg-[#FAF7F0] text-xs font-medium text-[#4A5568] border-b border-[#E7E5DE]">
                  <tr>
                    <th scope="col" className="px-5 py-3">Member ID</th>
                    <th scope="col" className="px-5 py-3">Full Name</th>
                    <th scope="col" className="px-5 py-3">Voice Part</th>
                    <th scope="col" className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5DE]">
                  {members.map((member) => (
                    <tr
                      key={member.id}
                      onClick={() => router.push(`/members/${member.id}`)}
                      className="hover:bg-[#FAF7F0]/60 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FAF7F0] text-[#1B2340] border border-[#E7E5DE] tabular-nums">
                          {member.member_code}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-[#1B2340] whitespace-nowrap">
                        {member.full_name}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#C99A3E]/10 text-[#C99A3E] border border-[#C99A3E]/20">
                          {member.voice_part || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusBadge(
                            member.membership_status
                          )}`}
                        >
                          {member.membership_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Recent Rehearsals */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#1B2340]">
              Recent Rehearsals
            </h2>
            <p className="text-xs text-[#4A5568] mt-0.5">
              Attendance logs and voice part records for rehearsals
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center bg-[#C99A3E] hover:bg-[#b88c38] text-[#1B2340] font-medium text-xs px-4 py-2 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#C99A3E] focus:ring-offset-2 transition-colors shrink-0"
          >
            + Log Rehearsal Attendance
          </button>
        </div>

        <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5DE] overflow-hidden shadow-xs">
          {rehearsals.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#4A5568]">
              No rehearsal logs recorded yet. Click "+ Log Rehearsal Attendance" to add one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#1B2340]">
                <thead className="bg-[#FAF7F0] text-xs font-medium text-[#4A5568] border-b border-[#E7E5DE]">
                  <tr>
                    <th scope="col" className="px-5 py-3">Rehearsal Date</th>
                    <th scope="col" className="px-5 py-3">Member</th>
                    <th scope="col" className="px-5 py-3">Voice Part</th>
                    <th scope="col" className="px-5 py-3">Attended</th>
                    <th scope="col" className="px-5 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5DE]">
                  {rehearsals.map((r) => {
                    const dateStr = new Date(r.rehearsal_date).toLocaleDateString(
                      'en-US',
                      { month: 'short', day: 'numeric', year: 'numeric' }
                    )

                    return (
                      <tr key={r.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                        <td className="px-5 py-3.5 whitespace-nowrap font-medium tabular-nums text-[#1B2340]">
                          {dateStr}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-[#1B2340]">{r.full_name}</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FAF7F0] text-[#4A5568] border border-[#E7E5DE] tabular-nums">
                              {r.member_code}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="text-xs font-medium text-[#C99A3E]">
                            {r.voice_part}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {r.attended ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#6B8F71]/15 text-[#6B8F71] border border-[#6B8F71]/30">
                              ✓ Attended
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#B85C50]/15 text-[#B85C50] border border-[#B85C50]/30">
                              ✕ Absent
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-[#4A5568] max-w-xs truncate">
                          {r.notes || '—'}
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

      {/* Log Rehearsal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1B2340]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5DE] rounded-[12px] max-w-md w-full p-6 space-y-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E5DE]">
              <h3 className="font-serif text-lg font-semibold text-[#1B2340]">
                Log Rehearsal Attendance
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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

            <form onSubmit={handleSubmitRehearsal} className="space-y-4">
              {/* Member Selector */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#1B2340]">
                  Choir Member <span className="text-[#B85C50]">*</span>
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => handleMemberChange(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] px-3 py-2 text-sm text-[#1B2340] focus:outline-none focus:ring-2 focus:ring-[#C99A3E]"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.member_code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Rehearsal Date */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#1B2340]">
                  Rehearsal Date
                </label>
                <input
                  type="date"
                  required
                  value={rehearsalDate}
                  onChange={(e) => setRehearsalDate(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] px-3 py-2 text-sm text-[#1B2340] focus:outline-none focus:ring-2 focus:ring-[#C99A3E]"
                />
              </div>

              {/* Voice Part */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#1B2340]">
                  Voice Part
                </label>
                <select
                  value={voicePart}
                  onChange={(e) => setVoicePart(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] px-3 py-2 text-sm text-[#1B2340] focus:outline-none focus:ring-2 focus:ring-[#C99A3E]"
                >
                  <option value="Soprano">Soprano</option>
                  <option value="Alto">Alto</option>
                  <option value="Tenor">Tenor</option>
                  <option value="Bass">Bass</option>
                  <option value="Musician / Accompanist">Musician / Accompanist</option>
                  <option value="Choir Director">Choir Director</option>
                </select>
              </div>

              {/* Attendance Checkbox */}
              <div className="pt-1">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attended}
                    onChange={(e) => setAttended(e.target.checked)}
                    className="w-4 h-4 rounded border-[#E7E5DE] text-[#C99A3E] focus:ring-[#C99A3E]"
                  />
                  <span className="text-sm font-medium text-[#1B2340]">
                    Present at Rehearsal
                  </span>
                </label>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#1B2340]">
                  Rehearsal Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Songs practiced, solo assignments, etc."
                  className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] p-2.5 text-sm text-[#1B2340] placeholder-[#4A5568]/40 focus:outline-none focus:ring-2 focus:ring-[#C99A3E]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-[#E7E5DE] flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-medium text-[#4A5568] hover:text-[#1B2340]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#C99A3E] hover:bg-[#b88c38] text-[#1B2340] font-medium text-xs px-4 py-2 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#C99A3E] disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Rehearsal Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}