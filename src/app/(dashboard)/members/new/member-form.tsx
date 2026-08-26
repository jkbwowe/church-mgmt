'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createMemberAction, updateMemberAction } from './actions'

export type DepartmentOption = {
  id: string
  name: string
  accent_color: string
}

export type ExistingMemberData = {
  id: string
  member_code: string
  full_name: string
  gender: string | null
  phone: string | null
  email: string | null
  location: string | null
  membership_status: string
  date_joined: string | null
  baptism_status: string | null
  notes: string | null
  department_roles: { department_id: string; role_in_department: string | null }[]
}

interface MemberFormProps {
  nextMemberCode: string
  departments: DepartmentOption[]
  existingMember?: ExistingMemberData | null
}

export default function MemberForm({
  nextMemberCode,
  departments,
  existingMember,
}: MemberFormProps) {
  const isEdit = Boolean(existingMember)

  const [fullName, setFullName] = useState(existingMember?.full_name || '')
  const [gender, setGender] = useState(existingMember?.gender || 'male')
  const [phone, setPhone] = useState(existingMember?.phone || '')
  const [email, setEmail] = useState(existingMember?.email || '')
  const [location, setLocation] = useState(existingMember?.location || '')
  const [membershipStatus, setMembershipStatus] = useState(
    existingMember?.membership_status || 'active'
  )
  const [dateJoined, setDateJoined] = useState(
    existingMember?.date_joined
      ? new Date(existingMember.date_joined).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  )
  const [baptismStatus, setBaptismStatus] = useState(
    existingMember?.baptism_status || 'baptized'
  )
  const [notes, setNotes] = useState(existingMember?.notes || '')

  // Department Selection State
  const initialDeptMap = (existingMember?.department_roles || []).reduce(
    (acc, dr) => {
      acc[dr.department_id] = {
        selected: true,
        role: dr.role_in_department || '',
      }
      return acc;
    },
    {} as Record<string, { selected: boolean; role: string }>
  )

  const [selectedDepts, setSelectedDepts] = useState<
    Record<string, { selected: boolean; role: string }>
  >(initialDeptMap)

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const memberCodeToDisplay = isEdit ? existingMember!.member_code : nextMemberCode

  const toggleDepartment = (deptId: string) => {
    setSelectedDepts((prev) => {
      const current = prev[deptId] || { selected: false, role: '' }
      return {
        ...prev,
        [deptId]: {
          ...current,
          selected: !current.selected,
        },
      }
    })
  }

  const handleRoleChange = (deptId: string, role: string) => {
    setSelectedDepts((prev) => ({
      ...prev,
      [deptId]: {
        ...(prev[deptId] || { selected: true, role: '' }),
        role,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.')
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    const activeDeptAssignments = Object.entries(selectedDepts)
      .filter(([_, value]) => value.selected)
      .map(([deptId, value]) => ({
        department_id: deptId,
        role_in_department: value.role.trim() || null,
      }))

    const payload = {
      full_name: fullName.trim(),
      gender,
      phone: phone.trim() || null,
      email: email.trim() || null,
      location: location.trim() || null,
      membership_status: membershipStatus,
      date_joined: dateJoined,
      baptism_status: baptismStatus,
      notes: notes.trim() || null,
      departments: activeDeptAssignments,
    }

    try {
      if (isEdit && existingMember) {
        await updateMemberAction(existingMember.id, payload)
      } else {
        await createMemberAction({
          ...payload,
          member_code: memberCodeToDisplay,
        })
      }
    } catch (err: any) {
      // Next.js redirect throws an internal error, rethrow if so
      if (err?.digest?.startsWith('NEXT_REDIRECT')) {
        throw err
      }
      setErrorMsg(err?.message || 'Failed to save member. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-[700px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#1B2340]">
            {isEdit ? 'Edit Member Profile' : 'Add New Member'}
          </h1>
          <p className="text-xs text-[#4A5568] mt-0.5">
            SRS §7 Member Registration & §31 Central Record Management
          </p>
        </div>
        <Link
          href={isEdit ? `/members/${existingMember!.id}` : '/members'}
          className="text-xs text-[#4A5568] hover:text-[#1B2340] underline transition-colors"
        >
          ← Cancel
        </Link>
      </div>

      {/* Main White Card Surface */}
      <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5DE] p-6 sm:p-8 shadow-sm">
        
        {/* Dynamic Member ID Preview Pill */}
        <div className="bg-[#FAF7F0] border border-[#E7E5DE] rounded-[10px] p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider block">
              Central Member ID
            </span>
            <p className="text-xs text-[#4A5568]/80 mt-0.5">
              This member's unique ID across the whole church.
            </p>
          </div>
          <div className="shrink-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#1B2340] text-[#FFFFFF] tabular-nums tracking-wider shadow-xs">
              {fullName.trim() || isEdit ? memberCodeToDisplay : 'CH-XXXXXX'}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-[#B85C50]/10 border border-[#B85C50]/30 rounded-[8px] text-xs text-[#B85C50]">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Two-Column Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Full Name */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-medium text-[#1B2340]">
                Full Name <span className="text-[#B85C50]">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. David Nkosi"
                className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] px-3.5 py-2 text-sm text-[#1B2340] placeholder-[#4A5568]/40 focus:outline-none focus:ring-2 focus:ring-[#C99A3E] focus:border-[#C99A3E] transition-all"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#1B2340]">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] px-3 py-2 text-sm text-[#1B2340] focus:outline-none focus:ring-2 focus:ring-[#C99A3E] focus:border-[#C99A3E] transition-all"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#1B2340]">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+256 700 000000"
                className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] px-3.5 py-2 text-sm text-[#1B2340] tabular-nums placeholder-[#4A5568]/40 focus:outline-none focus:ring-2 focus:ring-[#C99A3E] focus:border-[#C99A3E] transition-all"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#1B2340]">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="david@example.com"
                className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] px-3.5 py-2 text-sm text-[#1B2340] placeholder-[#4A5568]/40 focus:outline-none focus:ring-2 focus:ring-[#C99A3E] focus:border-[#C99A3E] transition-all"
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#1B2340]">
                Location / Residence
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kampala, Zone 4"
                className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] px-3.5 py-2 text-sm text-[#1B2340] placeholder-[#4A5568]/40 focus:outline-none focus:ring-2 focus:ring-[#C99A3E] focus:border-[#C99A3E] transition-all"
              />
            </div>

            {/* Membership Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#1B2340]">
                Membership Status
              </label>
              <select
                value={membershipStatus}
                onChange={(e) => setMembershipStatus(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] px-3 py-2 text-sm text-[#1B2340] capitalize focus:outline-none focus:ring-2 focus:ring-[#C99A3E] focus:border-[#C99A3E] transition-all"
              >
                <option value="active">Active</option>
                <option value="new">New</option>
                <option value="inactive">Inactive</option>
                <option value="transferred">Transferred</option>
              </select>
            </div>

            {/* Date Joined */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#1B2340]">
                Date Joined
              </label>
              <input
                type="date"
                value={dateJoined}
                onChange={(e) => setDateJoined(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] px-3.5 py-2 text-sm text-[#1B2340] focus:outline-none focus:ring-2 focus:ring-[#C99A3E] focus:border-[#C99A3E] transition-all"
              />
            </div>

            {/* Baptism Status */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-medium text-[#1B2340]">
                Baptism Status
              </label>
              <select
                value={baptismStatus}
                onChange={(e) => setBaptismStatus(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] px-3 py-2 text-sm text-[#1B2340] capitalize focus:outline-none focus:ring-2 focus:ring-[#C99A3E] focus:border-[#C99A3E] transition-all"
              >
                <option value="baptized">Baptized</option>
                <option value="unbaptized">Unbaptized</option>
                <option value="pending_confirmation">Pending Confirmation</option>
              </select>
            </div>

            {/* Notes (Full Width Textarea) */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-medium text-[#1B2340]">
                Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional background, spiritual notes, or family relationships..."
                className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] p-3 text-sm text-[#1B2340] placeholder-[#4A5568]/40 focus:outline-none focus:ring-2 focus:ring-[#C99A3E] focus:border-[#C99A3E] transition-all"
              />
            </div>
          </div>

          {/* Department Attachments Section (§31 Core Principle) */}
          <div className="pt-6 border-t border-[#E7E5DE] space-y-4">
            <div>
              <h3 className="font-serif text-base font-medium text-[#1B2340]">
                Department Assignments
              </h3>
              <p className="text-xs text-[#4A5568]">
                Assign this member to church departments. These records attach directly to this central profile.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {departments.map((dept) => {
                const isSelected = Boolean(selectedDepts[dept.id]?.selected)
                const roleValue = selectedDepts[dept.id]?.role || ''

                return (
                  <div
                    key={dept.id}
                    className={`p-3.5 rounded-[10px] border transition-all ${
                      isSelected
                        ? 'bg-[#FAF7F0] border-[#C99A3E]/60 shadow-xs'
                        : 'bg-[#FFFFFF] border-[#E7E5DE] hover:border-[#4A5568]/30'
                    }`}
                  >
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleDepartment(dept.id)}
                        className="w-4 h-4 rounded border-[#E7E5DE] text-[#C99A3E] focus:ring-[#C99A3E]"
                      />
                      <span className="flex items-center space-x-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: dept.accent_color || '#C99A3E' }}
                        />
                        <span className="text-sm font-medium text-[#1B2340]">
                          {dept.name}
                        </span>
                      </span>
                    </label>

                    {/* Inline Role Input Revealed when Checked */}
                    {isSelected && (
                      <div className="mt-3 pl-7">
                        <input
                          type="text"
                          value={roleValue}
                          onChange={(e) => handleRoleChange(dept.id, e.target.value)}
                          placeholder={`Role in ${dept.name} (e.g. Alto, Lead Deacon)`}
                          className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[6px] px-3 py-1.5 text-xs text-[#1B2340] placeholder-[#4A5568]/40 focus:outline-none focus:ring-1 focus:ring-[#C99A3E] focus:border-[#C99A3E]"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Form Controls */}
          <div className="pt-6 border-t border-[#E7E5DE] flex items-center justify-end space-x-4">
            <Link
              href={isEdit ? `/members/${existingMember!.id}` : '/members'}
              className="text-sm font-medium text-[#4A5568] hover:text-[#1B2340] transition-colors"
            >
              Cancel
            </Link>
            
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#C99A3E] hover:bg-[#b88c38] text-[#1B2340] font-medium text-sm px-6 py-2.5 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#C99A3E] focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}