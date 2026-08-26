'use server'

import { redirect } from 'next/navigation'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'require' })

type MemberPayload = {
  member_code?: string
  full_name: string
  gender: string | null
  phone: string | null
  email: string | null
  location: string | null
  membership_status: string
  date_joined: string | null
  baptism_status: string | null
  notes: string | null
  departments: { department_id: string; role_in_department: string | null }[]
}

export async function createMemberAction(data: MemberPayload) {
  // 1. Insert central member record
  const result = await sql`
    INSERT INTO members (
      member_code,
      full_name,
      gender,
      phone,
      email,
      location,
      membership_status,
      date_joined,
      baptism_status,
      notes
    ) VALUES (
      ${data.member_code ?? null},
      ${data.full_name},
      ${data.gender ?? null},
      ${data.phone ?? null},
      ${data.email ?? null},
      ${data.location ?? null},
      ${data.membership_status},
      ${data.date_joined ?? null},
      ${data.baptism_status ?? null},
      ${data.notes ?? null}
    )
    RETURNING id
  `

  const newMemberId = result[0].id

  // 2. Insert attached department records
  if (data.departments && data.departments.length > 0) {
    for (const dept of data.departments) {
      await sql`
        INSERT INTO member_departments (
          member_id,
          department_id,
          role_in_department,
          date_assigned
        ) VALUES (
          ${newMemberId},
          ${dept.department_id},
          ${dept.role_in_department ?? null},
          NOW()
        )
      `
    }
  }

  // 3. Redirect to the newly created member's profile
  redirect(`/members/${newMemberId}`)
}

export async function updateMemberAction(id: string, data: MemberPayload) {
  // 1. Update central record
  await sql`
    UPDATE members SET
      full_name = ${data.full_name},
      gender = ${data.gender ?? null},
      phone = ${data.phone ?? null},
      email = ${data.email ?? null},
      location = ${data.location ?? null},
      membership_status = ${data.membership_status},
      date_joined = ${data.date_joined ?? null},
      baptism_status = ${data.baptism_status ?? null},
      notes = ${data.notes ?? null}
    WHERE id = ${id}
  `

  // 2. Refresh department relationships
  await sql`DELETE FROM member_departments WHERE member_id = ${id}`

  if (data.departments && data.departments.length > 0) {
    for (const dept of data.departments) {
      await sql`
        INSERT INTO member_departments (
          member_id,
          department_id,
          role_in_department,
          date_assigned
        ) VALUES (
          ${id},
          ${dept.department_id},
          ${dept.role_in_department ?? null},
          NOW()
        )
      `
    }
  }

  redirect(`/members/${id}`)
}