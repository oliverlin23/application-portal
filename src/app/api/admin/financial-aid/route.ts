import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'DENIED']),
  applicationId: z.string()
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')

    // Get all financial aid applications with related data
    const [applications, counts] = await Promise.all([
      prisma.financialAidApplication.findMany({
        where: {
          AND: [
            {
              OR: [
                {
                  application: {
                    OR: [
                      { name: { contains: search, mode: 'insensitive' } },
                      { email: { contains: search, mode: 'insensitive' } },
                      { school: { contains: search, mode: 'insensitive' } },
                    ]
                  }
                },
                { dependents: { contains: search, mode: 'insensitive' } },
                { householdIncome: { contains: search, mode: 'insensitive' } },
                { circumstances: { contains: search, mode: 'insensitive' } },
              ]
            },
            status && status !== 'ALL' ? { status } : {},
          ]
        },
        include: {
          application: {
            select: {
              name: true,
              email: true,
              school: true,
              user: {
                select: {
                  profile: {
                    select: {
                      parentEmail: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          submittedAt: 'desc'
        }
      }),
      prisma.financialAidApplication.groupBy({
        by: ['status'],
        _count: true
      })
    ])

    // Format status counts
    const statusCounts = {
      PENDING: 0,
      APPROVED: 0,
      DENIED: 0,
      ...Object.fromEntries(
        counts.map(({ status, _count }) => [status, _count])
      )
    }

    const stats = {
      totalApplications: applications.length,
      pendingApplications: statusCounts.PENDING,
      approvedApplications: statusCounts.APPROVED,
      deniedApplications: statusCounts.DENIED,
      recentApplications: applications.slice(0, 5)
    }

    return NextResponse.json({
      applications,
      counts: statusCounts,
      stats,
      total: applications.length
    })
  } catch (error) {
    console.error('Failed to fetch financial aid applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch financial aid applications' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const { status, applicationId } = updateStatusSchema.parse(data)

    const updatedApplication = await prisma.financialAidApplication.update({
      where: { id: applicationId },
      data: { status }
    })

    return NextResponse.json(updatedApplication)
  } catch (error) {
    console.error('Failed to update financial aid status:', error)
    return NextResponse.json(
      { error: 'Failed to update financial aid status' },
      { status: 500 }
    )
  }
} 