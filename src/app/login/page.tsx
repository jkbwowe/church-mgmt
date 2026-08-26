'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { authenticate } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-[#C99A3E] text-[#1B2340] font-medium text-sm py-2.5 px-4 rounded-[8px] hover:bg-[#b88c38] focus:outline-none focus:ring-2 focus:ring-[#C99A3E] focus:ring-offset-2 focus:ring-offset-[#FFFFFF] transition-colors disabled:opacity-70"
    >
      {pending ? 'Signing in...' : 'Sign in'}
    </button>
  )
}

export default function LoginPage() {
  const [state, formAction] = useActionState(authenticate, { error: null })

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col items-center justify-center relative overflow-hidden font-sans text-[#1B2340]">
      
      {/* Subtle, static geometric background pattern (Faceted gold lines) */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.08] z-0" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="10%" y1="-10%" x2="40%" y2="110%" stroke="#C99A3E" strokeWidth="1" />
        <line x1="90%" y1="-10%" x2="60%" y2="110%" stroke="#C99A3E" strokeWidth="1" />
        <line x1="-10%" y1="25%" x2="110%" y2="15%" stroke="#C99A3E" strokeWidth="1" />
        <line x1="-10%" y1="75%" x2="110%" y2="85%" stroke="#C99A3E" strokeWidth="1" />
        <polygon points="40%,10% 60%,30% 70%,70% 30%,80% 20%,40%" stroke="#C99A3E" strokeWidth="1" fill="none" />
      </svg>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-[400px] px-6 py-8 bg-[#FFFFFF] rounded-[12px] border border-[#E7E5DE] shadow-sm">
        
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl font-medium text-[#1B2340] mb-1">
            Grace Community Church
          </h1>
          <p className="text-sm text-[#4A5568]">
            Sign in to manage your church
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          
          {/* Error Message */}
          {state.error && (
            <div className="p-3 bg-[#B85C50]/10 border border-[#B85C50]/20 rounded-[8px]">
              <p className="text-sm text-[#B85C50] text-center font-medium">
                {state.error}
              </p>
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-[#1B2340]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full border border-[#E7E5DE] rounded-[8px] px-3 py-2 text-sm text-[#1B2340] bg-[#FFFFFF] placeholder-[#4A5568]/50 focus:outline-none focus:ring-2 focus:ring-[#C99A3E] focus:border-[#C99A3E] transition-shadow"
              placeholder="admin@church.test"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-[#1B2340]">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full border border-[#E7E5DE] rounded-[8px] px-3 py-2 text-sm text-[#1B2340] bg-[#FFFFFF] placeholder-[#4A5568]/50 focus:outline-none focus:ring-2 focus:ring-[#C99A3E] focus:border-[#C99A3E] transition-shadow"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <SubmitButton />
          </div>

          <div className="text-center mt-4">
            <a 
              href="#" 
              className="text-sm text-[#4A5568] hover:text-[#1B2340] focus:outline-none focus:ring-2 focus:ring-[#C99A3E] rounded-[4px] px-1 py-0.5 transition-colors"
            >
              Forgot password?
            </a>
          </div>
        </form>

      </div>

      {/* Demo Hint */}
      <div className="relative z-10 mt-6 text-center">
        <p className="text-xs text-[#4A5568] opacity-80 font-mono tracking-wide">
          Demo: admin@church.test / password123
        </p>
      </div>

    </div>
  )
}