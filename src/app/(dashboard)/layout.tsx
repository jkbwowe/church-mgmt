import Link from 'next/link'
import { headers } from 'next/headers'
import { cookies } from 'next/headers'

// Navigation link definition
const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Members', href: '/members' },
  { name: 'Departments', href: '/departments' },
  { name: 'Attendance', href: '/attendance' },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Read session cookie for user info
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('church_session')?.value
  
  let user = { name: 'Staff Member', role: 'Staff' }
  if (sessionCookie) {
    try {
      user = JSON.parse(sessionCookie)
    } catch {
      // Fallback if parsing fails
    }
  }

  // Determine pathname for active link state from headers
  const headerList = await headers()
  const pathname = headerList.get('x-pathname') || '/dashboard'

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#1B2340] font-sans flex flex-col md:flex-row">
      
      {/* Sidebar - Desktop (Fixed 240px) */}
      <aside className="hidden md:flex w-[240px] flex-col justify-between bg-[#1B2340] text-[#FFFFFF] shrink-0 fixed inset-y-0 left-0 z-30">
        <div>
          {/* Church Branding Header */}
          <div className="p-6 border-b border-[#E7E5DE]/10">
            <h1 className="font-serif text-xl font-medium tracking-tight text-[#FFFFFF]">
              Word of Life
            </h1>
            <p className="text-xs text-[#E7E5DE]/60 mt-0.5">Church Management System</p>
          </div>

          {/* Navigation Links */}
          <nav className="mt-4 px-0 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-[#C99A3E] focus:ring-inset ${
                    isActive
                      ? 'border-l-[3px] border-[#C99A3E] text-[#FFFFFF] bg-white/5'
                      : 'border-l-[3px] border-transparent text-[#E7E5DE]/70 hover:text-[#FFFFFF] hover:bg-white/5'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Info & Logout Footer */}
        <div className="p-5 border-t border-[#E7E5DE]/10 bg-[#1B2340]">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-sm font-medium text-[#FFFFFF] truncate">{user.name}</p>
              <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-medium bg-[#C99A3E]/20 text-[#C99A3E] border border-[#C99A3E]/30 rounded-full uppercase tracking-wider">
                {user.role}
              </span>
            </div>
            <form action="/login" method="GET">
              <button
                type="submit"
                className="text-xs text-[#E7E5DE]/60 hover:text-[#FFFFFF] px-2 py-1 rounded-[6px] border border-[#E7E5DE]/20 hover:border-[#E7E5DE]/40 focus:outline-none focus:ring-2 focus:ring-[#C99A3E] transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 md:pl-[240px] flex flex-col min-h-screen">
        
        {/* Topbar */}
        <header className="h-16 border-b border-[#E7E5DE] bg-[#FAF7F0] px-6 md:px-8 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="font-serif text-xl font-medium text-[#1B2340]">
              Overview
            </h2>
          </div>

          {/* Global Search & User Profile */}
          <div className="flex items-center space-x-4">
            <div className="relative w-48 sm:w-64">
              <input
                type="search"
                placeholder="Search member, code, phone..."
                className="w-full bg-[#FFFFFF] border border-[#E7E5DE] rounded-[8px] px-3 py-1.5 text-xs text-[#1B2340] placeholder-[#4A5568]/60 focus:outline-none focus:ring-2 focus:ring-[#C99A3E] focus:border-[#C99A3E] transition-all"
              />
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#1B2340] text-[#FAF7F0] font-serif font-medium text-xs flex items-center justify-center border border-[#E7E5DE]">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-[1200px] w-full mx-auto pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#1B2340] border-t border-[#E7E5DE]/10 flex justify-around items-center h-16 z-30">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors ${
                isActive
                  ? 'text-[#C99A3E] border-t-2 border-[#C99A3E]'
                  : 'text-[#E7E5DE]/60 hover:text-[#FFFFFF]'
              }`}
            >
              {item.name}
            </Link>
          )
        })}
      </nav>

    </div>
  )
}