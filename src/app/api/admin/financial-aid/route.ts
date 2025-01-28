import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'DENIED']),
  applicationId: z.string()
})

export async function GET() {
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

    // Get all financial aid applications with related data
    const applications = await prisma.financialAidApplication.findMany({
      include: {
        application: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                profile: {
                  select: {
                    school: true,
                    gradeLevel: true,
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
    })

    return NextResponse.json(applications)
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