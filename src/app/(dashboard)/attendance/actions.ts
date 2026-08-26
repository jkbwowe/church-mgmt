'use server'

import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/db'

export async function saveAttendanceAction(data: {
  attendance_date: string
  service_type: string
  present_member_ids: string[]
}) {
  const { attendance_date, service_type, present_member_ids } = data

  // 1. Delete existing attendance records for this date & service type
  await sql`
    DELETE FROM attendance
    WHERE attendance_date = ${attendance_date}
      AND service_type = ${service_type}
  `

  // 2. Insert present members
  if (present_member_ids.length > 0) {
    for (const memberId of present_member_ids) {
      await sql`
        INSERT INTO attendance (
          member_id,
          service_type,
          attendance_date,
          status
        ) VALUES (
          ${memberId},
          ${service_type},
          ${attendance_date},
          'present'
        )
      `
    }
  }

  revalidatePath('/attendance')
}