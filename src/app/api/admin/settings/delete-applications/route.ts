import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import type { Session } from 'next-auth'

interface AdminSession extends Session {
  user: {
    isAdmin: boolean
  } & Session['user']
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session as AdminSession).user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete all applications
    await prisma.application.deleteMany()

    return NextResponse.json({
      success: true,
      message: 'All applications deleted successfully'
    })

  } catch (error) {
    console.error('Delete applications error:', error)
    return NextResponse.json(
      { error: 'Failed to delete applications' },
      { status: 500 }
    )
  }
} 