import MemberForm, { DepartmentOption, ExistingMemberData } from './member-form'
import { sql } from '@/lib/db'

export const revalidate = 0

interface PageProps {
  searchParams: Promise<{ edit?: string }>
}

export default async function NewMemberPage({ searchParams }: PageProps) {
  const { edit: editId } = await searchParams

  // 1. Fetch available departments
  const deptRows = await sql`
    SELECT id, name, accent_color FROM departments ORDER BY name ASC
  `
  const departments: DepartmentOption[] = deptRows.map((d) => ({
    id: d.id,
    name: d.name,
    accent_color: d.accent_color,
  }))

  // 2. Determine Next Member Code (Sequential CH-XXXXXX)
  const countRow = await sql`
    SELECT COALESCE(
      MAX(
        CAST(
          NULLIF(REGEXP_REPLACE(member_code, '[^0-9]', '', 'g'), '') AS INTEGER
        )
      ), 
      0
    ) + 1 AS next_seq 
    FROM members
  `
  const nextSeq = countRow[0]?.next_seq || 1
  const nextMemberCode = `CH-${String(nextSeq).padStart(6, '0')}`

  // 3. Optional: Fetch existing member data if edit mode
  let existingMember: ExistingMemberData | null = null
  if (editId) {
    const memberRows = await sql`SELECT * FROM members WHERE id = ${editId} LIMIT 1`
    if (memberRows.length > 0) {
      const m = memberRows[0]
      const deptRolesRows = await sql`
        SELECT department_id, role_in_department 
        FROM member_departments 
        WHERE member_id = ${editId}
      `

      existingMember = {
        id: m.id,
        member_code: m.member_code,
        full_name: m.full_name,
        gender: m.gender,
        phone: m.phone,
        email: m.email,
        location: m.location,
        membership_status: m.membership_status,
        date_joined: m.date_joined,
        baptism_status: m.baptism_status,
        notes: m.notes,
        department_roles: deptRolesRows.map((r) => ({
          department_id: r.department_id,
          role_in_department: r.role_in_department,
        })),
      }
    }
  }

  return (
    <MemberForm
      nextMemberCode={nextMemberCode}
      departments={departments}
      existingMember={existingMember}
    />
  )
}
