'use server'

import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/db'

export async function logRehearsalAction(data: {
  member_id: string
  rehearsal_date: string
  voice_part: string
  attended: boolean
  notes: string | null
}) {
  await sql`
    INSERT INTO choir_records (
      member_id,
      rehearsal_date,
      voice_part,
      attended,
      notes
    ) VALUES (
      ${data.member_id},
      ${data.rehearsal_date},
      ${data.voice_part},
      ${data.attended},
      ${data.notes ?? null}
    )
  `

  revalidatePath('/departments/choir')
}