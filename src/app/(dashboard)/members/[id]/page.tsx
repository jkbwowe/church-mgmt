import { notFound } from 'next/navigation'
import Link from 'next/link'
import postgres from 'postgres'
import MemberTabs, {
  DepartmentMembership,
  ChoirRecord,
  PastoralRecord,
  AttendanceRecord,
} from './member-tabs'

const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'require' })

export const revalidate = 0 // Always render live data

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MemberDetailPage({ params }: PageProps) {
  const { id } = await params

  // Query 1: Main central member record
  const members = await sql`
    SELECT * FROM members WHERE id = ${id} LIMIT 1
  `
  if (members.length === 0) {
    notFound()
  }
  const member = members[0]

  // Query 2: Joined department records (the core multi-department relationship)
  const departmentRows = await sql`
    SELECT 
      md.id,
      md.department_id,
      md.role_in_department,
      md.date_assigned,
      d.name as department_name,
      d.slug as department_slug,
      d.accent_color
    FROM member_departments md
    JOIN departments d ON md.department_id = d.id
    WHERE md.member_id = ${id}
    ORDER BY d.name ASC
  `

  // Query 3: Choir Records
  const choirRows = await sql`
    SELECT id, rehearsal_date, voice_part, attended, notes 
    FROM choir_records 
    WHERE member_id = ${id} 
    ORDER BY rehearsal_date DESC
  `

  // Query 4: Pastoral Records
  const pastoralRows = await sql`
    SELECT id, visit_date, visit_type, assigned_pastor, confidential_notes, status 
    FROM pastoral_records 
    WHERE member_id = ${id} 
    ORDER BY visit_date DESC
  `

  // Query 5: Attendance Records
  const attendanceRows = await sql`
    SELECT id, service_type, service_date, present 
    FROM attendance 
    WHERE member_id = ${id} 
    ORDER BY service_date DESC
  `

  // Cast retrieved SQL data to strongly typed structures
  const departments: DepartmentMembership[] = departmentRows.map((d) => ({
    id: d.id,
    department_id: d.department_id,
    department_name: d.department_name,
    department_slug: d.department_slug,
    accent_color: d.accent_color,
    role_in_department: d.role_in_department,
    date_assigned: d.date_assigned,
  }))

  const choirRecords: ChoirRecord[] = choirRows.map((r) => ({
    id: r.id,
    rehearsal_date: r.rehearsal_date,
    voice_part: r.voice_part,
    attended: Boolean(r.attended),
    notes: r.notes,
  }))

  const pastoralRecords: PastoralRecord[] = pastoralRows.map((r) => ({
    id: r.id,
    visit_date: r.visit_date,
    visit_type: r.visit_type,
    assigned_pastor: r.assigned_pastor,
    confidential_notes: r.confidential_notes,
    status: r.status,
  }))

  const attendanceRecords: AttendanceRecord[] = attendanceRows.map((r) => ({
    id: r.id,
    service_type: r.service_type,
    service_date: r.service_date,
    present: Boolean(r.present),
  }))

  // Helper for Member Initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  // Format status badge styles
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

  const dateJoinedStr = member.date_joined
    ? new Date(member.date_joined).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '—'

  return (
    <div className="space-y-6">
      
      {/* 1. Full-Width Header Surface Card (Signature Visual Moment) */}
      <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5DE] p-6 sm:p-8 flex flex-col sm:flex-row items-start justify-between gap-6">
        
        <div className="flex items-start space-x-5">
          {/* Photo / Initials Placeholder */}
          {member.photo_url ? (
            <img
              src={member.photo_url}
              alt={member.full_name}
              className="w-20 h-20 rounded-full object-cover border border-[#E7E5DE] shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#1B2340]/10 text-[#1B2340] flex items-center justify-center font-serif text-2xl font-semibold border border-[#E7E5DE] shrink-0">
              {getInitials(member.full_name)}
            </div>
          )}

          <div className="space-y-2">
            {/* Full Name in Fraunces + Member Code Pill + Status Pill */}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-3xl font-semibold text-[#1B2340] tracking-tight">
                {member.full_name}
              </h1>

              {/* Central Record Member Code Badge */}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-sans font-medium bg-[#FAF7F0] text-[#1B2340] border border-[#E7E5DE] tabular-nums tracking-[0.02em]">
                {member.member_code}
              </span>

              {/* Status Pill */}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusBadge(
                  member.membership_status
                )}`}
              >
                {member.membership_status || 'Active'}
              </span>
            </div>

            {/* Signature Visual Moment: Multi-Department Colored Accent Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {departments.length === 0 ? (
                <span className="text-xs text-[#4A5568]/60 italic">
                  No department assignments
                </span>
              ) : (
                departments.map((dept) => (
                  <span
                    key={dept.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-shadow"
                    style={{
                      backgroundColor: `${dept.accent_color}15`,
                      borderColor: `${dept.accent_color}40`,
                      color: dept.accent_color,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full mr-1.5 shrink-0"
                      style={{ backgroundColor: dept.accent_color }}
                    />
                    <span>
                      {dept.department_name}
                      {dept.role_in_department ? ` — ${dept.role_in_department}` : ''}
                    </span>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action: Edit Button (Secondary Style) */}
        <div className="shrink-0 w-full sm:w-auto">
          <Link
            href={`/members/new?edit=${member.id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center bg-[#FFFFFF] text-[#1B2340] border border-[#E7E5DE] hover:border-[#C99A3E] font-medium text-sm px-4 py-2 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#C99A3E] transition-colors"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* 2. Basic Information Definition-List Card */}
      <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5DE] p-6">
        <h2 className="font-serif text-lg font-medium text-[#1B2340] mb-4 pb-3 border-b border-[#E7E5DE]/60">
          Basic Information
        </h2>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div className="flex justify-between sm:justify-start sm:grid sm:grid-cols-3">
            <dt className="text-[#4A5568] font-medium">Gender</dt>
            <dd className="text-[#1B2340] sm:col-span-2 capitalize">{member.gender || '—'}</dd>
          </div>

          <div className="flex justify-between sm:justify-start sm:grid sm:grid-cols-3">
            <dt className="text-[#4A5568] font-medium">Phone</dt>
            <dd className="text-[#1B2340] sm:col-span-2 tabular-nums">{member.phone || '—'}</dd>
          </div>

          <div className="flex justify-between sm:justify-start sm:grid sm:grid-cols-3">
            <dt className="text-[#4A5568] font-medium">Email</dt>
            <dd className="text-[#1B2340] sm:col-span-2">{member.email || '—'}</dd>
          </div>

          <div className="flex justify-between sm:justify-start sm:grid sm:grid-cols-3">
            <dt className="text-[#4A5568] font-medium">Location</dt>
            <dd className="text-[#1B2340] sm:col-span-2">{member.location || '—'}</dd>
          </div>

          <div className="flex justify-between sm:justify-start sm:grid sm:grid-cols-3">
            <dt className="text-[#4A5568] font-medium">Date Joined</dt>
            <dd className="text-[#1B2340] sm:col-span-2 tabular-nums">{dateJoinedStr}</dd>
          </div>

          <div className="flex justify-between sm:justify-start sm:grid sm:grid-cols-3">
            <dt className="text-[#4A5568] font-medium">Baptism Status</dt>
            <dd className="text-[#1B2340] sm:col-span-2 capitalize">
              {member.baptism_status || '—'}
            </dd>
          </div>

          {member.notes && (
            <div className="md:col-span-2 pt-2 border-t border-[#E7E5DE]/40">
              <dt className="text-[#4A5568] font-medium mb-1">Notes</dt>
              <dd className="text-[#1B2340] leading-relaxed bg-[#FAF7F0] p-3 rounded-[8px] border border-[#E7E5DE]">
                {member.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* 3. Department & Record Tabs Section */}
      <MemberTabs
        departments={departments}
        choirRecords={choirRecords}
        pastoralRecords={pastoralRecords}
        attendanceRecords={attendanceRecords}
      />

    </div>
  )
}