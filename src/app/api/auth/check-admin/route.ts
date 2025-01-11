import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { Session } from 'next-auth'

interface AdminSession extends Session {
  user: {
    isAdmin: boolean
  } & Session['user']
}

export async function GET() {
  const session = await getServerSession(authOptions)
  return NextResponse.json({ 
    isAdmin: !!(session?.user && (session as AdminSession).user.isAdmin) 
  })
} 