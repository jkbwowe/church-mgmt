import ChoirClient, {
  ChoirDepartmentInfo,
  ChoirMember,
  ChoirRehearsal,
} from './choir-client'
import { sql } from '@/lib/db'

export const revalidate = 0 // Always fetch fresh database stats

export default async function ChoirDepartmentPage() {
  // Query 1: Choir department details
  const deptRows = await sql`
    SELECT id, name, description, accent_color 
    FROM departments 
    WHERE slug = 'choir' OR LOWER(name) LIKE '%choir%'
    LIMIT 1
  `

  const deptInfo: ChoirDepartmentInfo =
    deptRows.length > 0
      ? {
          id: deptRows[0].id,
          name: deptRows[0].name,
          description: deptRows[0].description,
          accent_color: deptRows[0].accent_color,
        }
      : {
          id: '',
          name: 'Choir & Music',
          description: 'Vocal section organization, rehearsal logs, and ministry music tracking.',
          accent_color: '#C99A3E',
        }

  // Query 2: Choir members with their role / latest voice part
  const memberRows = await sql`
    SELECT 
      m.id,
      m.member_code,
      m.full_name,
      m.membership_status,
      md.role_in_department,
      (
        SELECT voice_part 
        FROM choir_records cr 
        WHERE cr.member_id = m.id 
        ORDER BY rehearsal_date DESC 
        LIMIT 1
      ) as latest_voice_part
    FROM members m
    JOIN member_departments md ON m.id = md.member_id
    JOIN departments d ON md.department_id = d.id
    WHERE d.slug = 'choir' OR LOWER(d.name) LIKE '%choir%'
    ORDER BY m.full_name ASC
  `

  const members: ChoirMember[] = memberRows.map((m) => ({
    id: m.id,
    member_code: m.member_code,
    full_name: m.full_name,
    membership_status: m.membership_status,
    voice_part: m.latest_voice_part || m.role_in_department || 'Soprano',
  }))

  // Query 3: Recent choir rehearsals
  const rehearsalRows = await sql`
    SELECT 
      cr.id,
      cr.member_id,
      cr.rehearsal_date,
      cr.voice_part,
      cr.attended,
      cr.notes,
      m.full_name,
      m.member_code
    FROM choir_records cr
    JOIN members m ON cr.member_id = m.id
    ORDER BY cr.rehearsal_date DESC, cr.id DESC
    LIMIT 25
  `

  const rehearsals: ChoirRehearsal[] = rehearsalRows.map((r) => ({
    id: r.id,
    member_id: r.member_id,
    full_name: r.full_name,
    member_code: r.member_code,
    rehearsal_date: r.rehearsal_date,
    voice_part: r.voice_part,
    attended: Boolean(r.attended),
    notes: r.notes,
  }))

  return (
    <ChoirClient
      deptInfo={deptInfo}
      members={members}
      rehearsals={rehearsals}
    />
  )
}
