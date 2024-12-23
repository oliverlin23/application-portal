import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './api/auth/[...nextauth]/route'

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Summer Debate Program Application Portal</h1>
      {session?.user ? (
        <div>
          <p className="mb-4">Welcome, {session.user.name || 'User'}!</p>
          <Link href="/application" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Start Application
          </Link>
        </div>
      ) : (
        <Link href="/api/auth/signin" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
          Sign In
        </Link>
      )}
    </div>
  )
}

