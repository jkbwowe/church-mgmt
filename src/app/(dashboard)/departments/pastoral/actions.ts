'use server'

import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/db'

export async function logPastoralVisitAction(data: {
  member_id: string
  visit_date: string
  visit_type: string
  assigned_pastor: string
  confidential_notes: string | null
  status: string
}) {
  await sql`
    INSERT INTO pastoral_records (
      member_id,
      visit_date,
      visit_type,
      assigned_pastor,
      confidential_notes,
      status
    ) VALUES (
      ${data.member_id},
      ${data.visit_date},
      ${data.visit_type},
      ${data.assigned_pastor},
      ${data.confidential_notes ?? null},
      ${data.status}
    )
  `

  revalidatePath('/departments/pastoral')
}