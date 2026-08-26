import postgres from 'postgres'
import AttendanceClient, {
  AttendanceMember,
  ExistingAttendanceRecord,
  AttendanceHistoryGroup,
} from './attendance-client'

const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'require' })

export const revalidate = 0 // Always fetch fresh database state

// Helper to compute the most recent Sunday date YYYY-MM-DD
function getMostRecentSundayDate(): string {
  const d = new Date()
  const day = d.getDay() // 0 is Sunday
  const diff = d.getDate() - day
  const sunday = new Date(d.setDate(diff))
  return sunday.toISOString().split('T')[0]
}

export default async function AttendancePage() {
  const initialSundayDate = getMostRecentSundayDate()

  // 1. Fetch all members with an indicator if they are choir members
  const memberRows = await sql`
    SELECT 
      m.id,
      m.member_code,
      m.full_name,
      EXISTS (
        SELECT 1 
        FROM member_departments md
        JOIN departments d ON md.department_id = d.id
        WHERE md.member_id = m.id 
          AND (d.slug = 'choir' OR LOWER(d.name) LIKE '%choir%')
      ) as is_choir_member
    FROM members m
    ORDER BY m.full_name ASC
  `

  const members: AttendanceMember[] = memberRows.map((m) => ({
    id: m.id,
    member_code: m.member_code,
    full_name: m.full_name,
    is_choir_member: Boolean(m.is_choir_member),
  }))

  // 2. Fetch existing attendance records
  const recordRows = await sql`
    SELECT member_id, service_type, attendance_date::text as attendance_date
    FROM attendance
    WHERE status = 'present' OR status = '1' OR status = 'true'
  `

  const existingRecords: ExistingAttendanceRecord[] = recordRows.map((r) => ({
    member_id: r.member_id,
    service_type: r.service_type,
    attendance_date: r.attendance_date,
  }))

  // 3. Group historical attendance records by date & service type
  const historyRows = await sql`
    SELECT 
      a.attendance_date::text as attendance_date,
      a.service_type,
      m.id as member_id,
      m.full_name,
      m.member_code
    FROM attendance a
    JOIN members m ON a.member_id = m.id
    WHERE a.status = 'present' OR a.status = '1' OR a.status = 'true'
    ORDER BY a.attendance_date DESC, m.full_name ASC
  `

  // Group raw rows into AttendanceHistoryGroup structure
  const historyGroupMap = new Map<string, AttendanceHistoryGroup>()

  for (const r of historyRows) {
    const key = `${r.attendance_date}-${r.service_type}`
    if (!historyGroupMap.has(key)) {
      historyGroupMap.set(key, {
        attendance_date: r.attendance_date,
        service_type: r.service_type,
        present_count: 0,
        members: [],
      })
    }

    const item = historyGroupMap.get(key)!
    item.present_count += 1
    item.members.push({
      id: r.member_id,
      full_name: r.full_name,
      member_code: r.member_code,
    })
  }

  const historyGroups = Array.from(historyGroupMap.values())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-[#1B2340]">
          Attendance Management
        </h1>
        <p className="text-xs text-[#4A5568] mt-0.5">
          SRS §10 — Service attendance tracking and historical logs
        </p>
      </div>

      <AttendanceClient
        initialSundayDate={initialSundayDate}
        members={members}
        existingRecords={existingRecords}
        historyGroups={historyGroups}
      />
    </div>
  )
}