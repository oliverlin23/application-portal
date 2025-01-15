import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { ApplicationStatus } from '@prisma/client'
import { sendStatusUpdateEmail } from '@/lib/mail'
import type { Session } from 'next-auth'

interface AdminSession extends Session {
  user: {
    isAdmin: boolean
  } & Session['user']
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session as AdminSession).user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const application = await prisma.application.findUnique({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status, udlStudent } = body as { status?: ApplicationStatus, udlStudent?: boolean }

    const application = await prisma.application.findUnique({
      where: { id: id },
      include: {
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
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const updatedApplication = await prisma.application.update({
      where: { id: id },
      data: { 
        ...(status && { status }),
        ...(udlStudent !== undefined && { udlStudent })
      }
    })

    // Send email notification for final status updates
    if (status && ['ACCEPTED', 'WAITLISTED', 'DENIED'].includes(status)) {
      await sendStatusUpdateEmail(
        application.email ?? '',
        application.user.profile?.parentEmail ?? '',
        application.name ?? '',
        status,
        application.udlStudent
      )
    }

    return NextResponse.json(updatedApplication)
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
} 