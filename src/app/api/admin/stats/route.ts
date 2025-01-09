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

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session as AdminSession).user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [
      totalApplications,
      submittedApplications,
      acceptedApplications,
      waitlistedApplications,
      recentApplications
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({
        where: { status: 'SUBMITTED' }
      }),
      prisma.application.count({
        where: { status: 'ACCEPTED' }
      }),
      prisma.application.count({
        where: { status: 'WAITLISTED' }
      }),
      prisma.application.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          createdAt: true
        }
      })
    ])

    return NextResponse.json({
      totalApplications,
      submittedApplications,
      acceptedApplications,
      waitlistedApplications,
      recentApplications
    })

  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    )
  }
} 