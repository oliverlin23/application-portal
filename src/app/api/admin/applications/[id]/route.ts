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

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session as AdminSession).user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const application = await prisma.application.findUnique({
      where: { id: params.id },
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
    console.error('Admin application error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session as AdminSession).user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status, udlStudent } = body

    const updatedApplication = await prisma.application.update({
      where: { id: params.id },
      data: {
        ...(status && { status: status as ApplicationStatus }),
        ...(udlStudent !== undefined && { udlStudent }),
      },
      include: {
        user: {
          select: {
            profile: true,
          },
        },
      },
    })

    return NextResponse.json(updatedApplication)
  } catch (error) {
    console.error('Admin application update error:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
} 