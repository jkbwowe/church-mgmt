import postgres from 'postgres'
import MembersClient, { MemberWithDepartments } from './members-client'

const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'require' })

export const revalidate = 0 // Ensure fresh member lists on render

export default async function MembersPage() {
  // Query all members along with their joined departments and accent colors
  const rows = await sql`
    SELECT 
      m.id,
      m.member_code,
      m.full_name,
      m.phone,
      m.membership_status,
      m.date_joined,
      COALESCE(
        json_agg(
          json_build_object(
            'id', d.id,
            'name', d.name,
            'accent_color', d.accent_color
          )
        ) FILTER (WHERE d.id IS NOT NULL),
        '[]'::json
      ) as departments
    FROM members m
    LEFT JOIN member_departments md ON m.id = md.member_id
    LEFT JOIN departments d ON md.department_id = d.id
    GROUP BY m.id
    ORDER BY m.full_name ASC
  `

  const members: MemberWithDepartments[] = rows.map((r) => ({
    id: r.id,
    member_code: r.member_code,
    full_name: r.full_name,
    phone: r.phone,
    membership_status: r.membership_status,
    date_joined: r.date_joined,
    departments: Array.isArray(r.departments) ? r.departments : [],
  }))

  return <MembersClient initialMembers={members} />
}