import DepartmentsClient, { DepartmentWithCount } from './departments-client'
import { sql } from '@/lib/db'

export const revalidate = 0 // Always fetch fresh database stats

export default async function DepartmentsPage() {
  // Query all departments and their total attached members count
  const rows = await sql`
    SELECT 
      d.id,
      d.name,
      d.slug,
      d.description,
      d.accent_color,
      COUNT(md.member_id)::int as member_count
    FROM departments d
    LEFT JOIN member_departments md ON d.id = md.department_id
    GROUP BY d.id
    ORDER BY d.name ASC
  `

  const departments: DepartmentWithCount[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    accent_color: r.accent_color,
    member_count: Number(r.member_count || 0),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-[#1B2340]">
          Departments
        </h1>
        <p className="text-xs text-[#4A5568] mt-0.5">
          SRS §8 Department Management & Attached Membership Directories
        </p>
      </div>

      {/* Client Department Grid */}
      <DepartmentsClient departments={departments} />
    </div>
  )
}
