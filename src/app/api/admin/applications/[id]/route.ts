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

type RouteSegment = {
  params: {
    id: string
  }
}

export async function GET(
  request: Request,
  context: RouteSegment
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session as AdminSession).user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const application = await prisma.application.findUnique({
      where: { id: context.params.id },
      include: {
        user: {
          select: {
            profile: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  context: RouteSegment
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session as AdminSession).user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status } = await request.json()

    if (!Object.values(ApplicationStatus).includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status value' 
      }, { status: 400 })
    }

    const application = await prisma.application.update({
      where: { id: context.params.id },
      data: { status: status as ApplicationStatus }
    })

    return NextResponse.json(application)

  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
} 