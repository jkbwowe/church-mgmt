import postgres from 'postgres'
import PastoralClient, {
  PastoralDepartmentInfo,
  PastoralMemberOption,
  PastoralRecord,
} from './pastoral-client'

const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'require' })

export const revalidate = 0 // Always fetch fresh database records

export default async function PastoralDepartmentPage() {
  // Query 1: Department details
  const deptRows = await sql`
    SELECT id, name, description, accent_color 
    FROM departments 
    WHERE slug = 'pastoral' OR slug = 'pastoral-care' OR LOWER(name) LIKE '%pastoral%'
    LIMIT 1
  `

  const deptInfo: PastoralDepartmentInfo =
    deptRows.length > 0
      ? {
          id: deptRows[0].id,
          name: deptRows[0].name,
          description: deptRows[0].description,
          accent_color: deptRows[0].accent_color || '#6B2A4A',
        }
      : {
          id: '',
          name: 'Pastoral Care',
          description: 'Spiritual care visitation, pastoral counseling, and confidential welfare support.',
          accent_color: '#6B2A4A',
        }

  // Query 2: All members for the "+ Log Visit" dropdown
  const memberRows = await sql`
    SELECT id, member_code, full_name
    FROM members
    ORDER BY full_name ASC
  `

  const members: PastoralMemberOption[] = memberRows.map((m) => ({
    id: m.id,
    member_code: m.member_code,
    full_name: m.full_name,
  }))

  // Query 3: Pastoral records ordered by visit_date DESC
  const recordRows = await sql`
    SELECT 
      pr.id,
      pr.member_id,
      pr.visit_date,
      pr.visit_type,
      pr.assigned_pastor,
      pr.confidential_notes,
      pr.status,
      m.full_name,
      m.member_code
    FROM pastoral_records pr
    JOIN members m ON pr.member_id = m.id
    ORDER BY pr.visit_date DESC, pr.id DESC
    LIMIT 50
  `

  const records: PastoralRecord[] = recordRows.map((r) => ({
    id: r.id,
    member_id: r.member_id,
    full_name: r.full_name,
    member_code: r.member_code,
    visit_date: r.visit_date,
    visit_type: r.visit_type,
    assigned_pastor: r.assigned_pastor,
    confidential_notes: r.confidential_notes,
    status: r.status,
  }))

  return (
    <PastoralClient
      deptInfo={deptInfo}
      members={members}
      records={records}
    />
  )
}