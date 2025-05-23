import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import type { Session } from 'next-auth'

interface AdminSession extends Session {
  user: {
    isAdmin: boolean
  } & Session['user']
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || !(session as AdminSession).user.isAdmin) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4">
        <nav className="space-y-2">
          <Link href="/admin" className="block p-2 hover:bg-gray-200 rounded">
            Dashboard
          </Link>
          <Link href="/admin/applications" className="block p-2 hover:bg-gray-200 rounded">
            Applications
          </Link>
          <Link href="/admin/financial-aid" className="block p-2 hover:bg-gray-200 rounded">
            Financial Aid
          </Link>
          <Link href="/admin/tools" className="block p-2 hover:bg-gray-200 rounded">
            Tools
          </Link>
          <Link href="/admin/settings" className="block p-2 hover:bg-gray-200 rounded">
            Settings
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
} 