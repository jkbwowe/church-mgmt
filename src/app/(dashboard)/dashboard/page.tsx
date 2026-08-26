import Link from 'next/link'
import { sql } from '@/lib/db'

export const revalidate = 0 // Fetch fresh data on page render

export default async function DashboardPage() {
  // 1. Fetch Summary Stats
  const [totalMembersRes, activeMembersRes, newMembersRes, recentAttendanceRes] = await Promise.all([
    sql`SELECT COUNT(*)::int as count FROM members`,
    sql`SELECT COUNT(*)::int as count FROM members WHERE membership_status = 'active'`,
    sql`SELECT COUNT(*)::int as count FROM members WHERE date_joined >= date_trunc('month', CURRENT_DATE)`,
    sql`
      SELECT 
        service_date,
        COUNT(CASE WHEN present THEN 1 END)::int as present_count
      FROM attendance
      WHERE service_date = (SELECT MAX(service_date) FROM attendance)
      GROUP BY service_date
    `
  ])

  const totalMembers = totalMembersRes[0]?.count || 0
  const activeMembers = activeMembersRes[0]?.count || 0
  const newMembersThisMonth = newMembersRes[0]?.count || 0
  const latestAttendance = recentAttendanceRes[0]?.present_count ?? null
  const latestAttendanceDate = recentAttendanceRes[0]?.service_date
    ? new Date(recentAttendanceRes[0].service_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null

  // 2. Fetch Last 4 Sundays Attendance Data for Bar Chart
  const attendanceHistory = await sql`
    SELECT 
      service_date,
      COUNT(CASE WHEN present THEN 1 END)::int as count
    FROM attendance
    GROUP BY service_date
    ORDER BY service_date DESC
    LIMIT 4
  `
  // Reverse to chronological order (left to right)
  const chartData = [...attendanceHistory].reverse()
  const maxAttendance = Math.max(...chartData.map((d) => d.count), 1)

  // 3. Fetch Departments with Member Counts
  const departments = await sql`
    SELECT 
      d.id,
      d.name,
      d.slug,
      d.accent_color,
      COUNT(md.member_id)::int as member_count
    FROM departments d
    LEFT JOIN member_departments md ON d.id = md.department_id
    GROUP BY d.id, d.name, d.slug, d.accent_color
    ORDER BY d.name ASC
  `

  // 4. Fetch Pending Pastoral Follow-ups
  const pastoralFollowups = await sql`
    SELECT 
      pr.id,
      pr.visit_date,
      pr.visit_type,
      pr.assigned_pastor,
      pr.status,
      m.id as member_id,
      m.full_name,
      m.member_code
    FROM pastoral_records pr
    JOIN members m ON pr.member_id = m.id
    WHERE pr.status = 'needs_followup'
    ORDER BY pr.visit_date DESC
    LIMIT 5
  `

  return (
    <div className="space-y-8">
      
      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Members */}
        <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5DE] p-5">
          <p className="font-serif text-3xl font-semibold text-[#1B2340] tabular-nums">
            {totalMembers.toLocaleString()}
          </p>
          <p className="text-sm text-[#4A5568] mt-1 font-medium">Total Members</p>
        </div>

        {/* Active Members */}
        <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5DE] p-5">
          <p className="font-serif text-3xl font-semibold text-[#1B2340] tabular-nums">
            {activeMembers.toLocaleString()}
          </p>
          <p className="text-sm text-[#4A5568] mt-1 font-medium">Active Members</p>
        </div>

        {/* New Members This Month */}
        <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5DE] p-5">
          <p className="font-serif text-3xl font-semibold text-[#1B2340] tabular-nums">
            {newMembersThisMonth.toLocaleString()}
          </p>
          <p className="text-sm text-[#4A5568] mt-1 font-medium">New This Month</p>
        </div>

        {/* Latest Sunday Attendance */}
        <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5DE] p-5">
          <p className="font-serif text-3xl font-semibold text-[#1B2340] tabular-nums">
            {latestAttendance !== null ? latestAttendance.toLocaleString() : '—'}
          </p>
          <p className="text-sm text-[#4A5568] mt-1 font-medium">
            {latestAttendanceDate ? `Attendance (${latestAttendanceDate})` : 'This Week Attendance'}
          </p>
        </div>
      </div>

      {/* Middle Section: Side-by-Side Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Attendance Bar Chart */}
        <div className="lg:col-span-7 bg-[#FFFFFF] rounded-[12px] border border-[#E7E5DE] p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-lg font-medium text-[#1B2340]">
              Attendance — last 4 Sundays
            </h3>
            <p className="text-xs text-[#4A5568] mt-0.5">Headcount per Sunday service</p>
          </div>

          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-[#4A5568]">No attendance recorded yet this week</p>
            </div>
          ) : (
            <div className="mt-6 pt-4 border-t border-[#E7E5DE]/60">
              <div className="h-44 flex items-end justify-between gap-4 px-4">
                {chartData.map((item, idx) => {
                  const heightPercent = Math.round((item.count / maxAttendance) * 100)
                  const formattedDate = new Date(item.service_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-xs font-semibold text-[#1B2340] tabular-nums">
                        {item.count}
                      </span>
                      <div className="w-full max-w-[48px] bg-[#FAF7F0] rounded-t-[6px] h-32 flex items-end overflow-hidden">
                        <div
                          style={{ height: `${Math.max(heightPercent, 4)}%` }}
                          className="w-full bg-[#C99A3E] rounded-t-[4px] transition-all group-hover:bg-[#b88c38]"
                        />
                      </div>
                      <span className="text-xs text-[#4A5568] font-medium">{formattedDate}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Departments List Card */}
        <div className="lg:col-span-5 bg-[#FFFFFF] rounded-[12px] border border-[#E7E5DE] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-medium text-[#1B2340]">
                Departments
              </h3>
              <Link
                href="/departments"
                className="text-xs font-medium text-[#4A5568] hover:text-[#1B2340] focus:outline-none focus:ring-2 focus:ring-[#C99A3E] rounded-[4px] px-1 transition-colors"
              >
                View all
              </Link>
            </div>

            <div className="space-y-1">
              {departments.length === 0 ? (
                <p className="text-sm text-[#4A5568] py-4">No departments found.</p>
              ) : (
                departments.map((dept) => (
                  <Link
                    key={dept.id}
                    href={`/departments/${dept.slug}`}
                    className="flex items-center justify-between p-2.5 rounded-[8px] hover:bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-[#C99A3E] transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: dept.accent_color || '#C99A3E' }}
                      />
                      <span className="text-sm font-medium text-[#1B2340] group-hover:underline decoration-[#E7E5DE]">
                        {dept.name}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-[#4A5568] bg-[#FAF7F0] border border-[#E7E5DE] px-2.5 py-0.5 rounded-full tabular-nums">
                      {dept.member_count} {dept.member_count === 1 ? 'member' : 'members'}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Pending Pastoral Follow-ups (Plum Header Accent) */}
      <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5DE] overflow-hidden">
        {/* Confidential Header with Plum Accent */}
        <div className="p-5 border-b border-[#E7E5DE] flex items-center justify-between bg-[#FAF7F0]/40">
          <div className="flex items-center space-x-3">
            <span className="w-2 h-5 bg-[#6B5B95] rounded-full" />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif text-lg font-medium text-[#1B2340]">
                  Pending Pastoral Follow-ups
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-medium bg-[#6B5B95]/10 text-[#6B5B95] rounded-full uppercase tracking-wider">
                  Confidential
                </span>
              </div>
              <p className="text-xs text-[#4A5568] mt-0.5">Members needing pastoral visitation or attention</p>
            </div>
          </div>

          <Link
            href="/departments/pastoral"
            className="text-xs font-medium text-[#6B5B95] hover:text-[#1B2340] focus:outline-none focus:ring-2 focus:ring-[#C99A3E] rounded-[4px] px-2 py-1 border border-[#6B5B95]/30 bg-white transition-colors"
          >
            View all
          </Link>
        </div>

        {/* Content Table / List */}
        {pastoralFollowups.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-[#4A5568]">No pending pastoral follow-ups recorded.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#1B2340]">
              <thead className="bg-[#FAF7F0] text-xs font-medium text-[#4A5568] border-b border-[#E7E5DE]">
                <tr>
                  <th scope="col" className="px-6 py-3">Member</th>
                  <th scope="col" className="px-6 py-3">Visit Type</th>
                  <th scope="col" className="px-6 py-3">Assigned Pastor</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5DE]/60">
                {pastoralFollowups.map((record) => {
                  const visitDate = new Date(record.visit_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })

                  return (
                    <tr key={record.id} className="hover:bg-[#FAF7F0]/60 transition-colors">
                      {/* Member + Central Code Badge */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center space-x-2.5">
                          <span className="font-medium text-[#1B2340]">{record.full_name}</span>
                          {/* Standard Pill Badge for Central Member Code */}
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-sans font-medium bg-[#FAF7F0] text-[#1B2340] border border-[#E7E5DE] tabular-nums tracking-[0.02em]">
                            {record.member_code}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-3.5 text-[#4A5568]">
                        <span className="capitalize">{record.visit_type || 'General Visit'}</span>
                      </td>

                      <td className="px-6 py-3.5 text-[#1B2340] font-medium">
                        {record.assigned_pastor || 'Unassigned'}
                      </td>

                      <td className="px-6 py-3.5 text-[#4A5568] tabular-nums">
                        {visitDate}
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        <Link
                          href={`/members/${record.member_id}`}
                          className="text-xs font-medium text-[#1B2340] bg-[#FFFFFF] border border-[#E7E5DE] hover:border-[#C99A3E] px-3 py-1 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C99A3E] transition-colors"
                        >
                          View Member
                        </Link>
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