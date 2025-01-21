import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { ApplicationStatus } from '@prisma/client'
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

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')

    const [applications, recentApplications] = await Promise.all([
      prisma.application.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { school: { contains: search, mode: 'insensitive' } },
                { gradeLevel: { contains: search, mode: 'insensitive' } },
                { yearsOfExperience: { contains: search, mode: 'insensitive' } },
                { numTournaments: { contains: search, mode: 'insensitive' } },
                { debateExperience: { contains: search, mode: 'insensitive' } },
                { interestEssay: { contains: search, mode: 'insensitive' } },
                { selfAptitudeAssessment: { contains: search, mode: 'insensitive' } },
              ],
            },
            status !== 'ALL' ? { status: status as ApplicationStatus } : {},
          ],
        },
        include: {
          user: {
            select: {
              isAdmin: true,
              profile: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      }),
      prisma.application.findMany({
        where: {
          user: {
            isAdmin: false
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      })
    ])

    // Filter out admin applications
    const filteredApplications = applications.filter(app => !app.user.isAdmin)

    // Get counts for each status (excluding admin applications)
    const counts = await prisma.application.groupBy({
      by: ['status'],
      _count: true,
      where: {
        user: {
          isAdmin: false
        }
      }
    })

    const statusCounts = Object.values(ApplicationStatus).reduce((acc, status) => {
      const count = counts.find(c => c.status === status)?._count || 0
      return { ...acc, [status]: count }
    }, {} as Record<ApplicationStatus, number>)

    const totalApplications = filteredApplications.length
    const submittedApplications = filteredApplications.filter(app => app.status === 'SUBMITTED').length
    const acceptedApplications = filteredApplications.filter(app => app.status === 'ACCEPTED').length
    const waitlistedApplications = filteredApplications.filter(app => app.status === 'WAITLISTED').length

    return NextResponse.json({
      applications: filteredApplications,
      counts: statusCounts,
      stats: {
        totalApplications,
        submittedApplications,
        acceptedApplications,
        waitlistedApplications,
        recentApplications
      },
      total: filteredApplications.length
    })

  } catch (error) {
    console.error('Applications fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
} 