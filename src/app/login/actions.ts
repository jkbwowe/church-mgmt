'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import postgres from 'postgres'
import bcrypt from 'bcryptjs'

// Reusing a single connection per serverless instance
const sql = postgres(process.env.DATABASE_URL || '', { ssl: 'require' })

export type LoginState = {
  error?: string | null;
}

export async function authenticate(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email or password is incorrect' }
  }

  try {
    // Query users table by email
    const users = await sql`
      SELECT id, name, email, password_hash, role, department 
      FROM users 
      WHERE email = ${email} 
      LIMIT 1
    `

    if (users.length === 0) {
      return { error: 'Email or password is incorrect' }
    }

    const user = users[0]

    // Compare with bcryptjs
    const passwordsMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordsMatch) {
      return { error: 'Email or password is incorrect' }
    }

    // Set secure session cookie
    const sessionData = JSON.stringify({
      id: user.id,
      role: user.role,
      name: user.name,
      department: user.department
    })

    // NEXT.JS 15 FIX: await the cookies() call
    const cookieStore = await cookies()
    cookieStore.set('church_session', sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    })

  } catch (error) {
    console.error('Login error:', error)
    return { error: 'Email or password is incorrect' }
  }

  // Redirect must be called outside the try/catch block
  redirect('/dashboard')
}