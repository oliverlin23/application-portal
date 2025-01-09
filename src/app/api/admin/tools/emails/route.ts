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
    const status = searchParams.get('status')

    const applications = await prisma.application.findMany({
      where: status !== 'ALL' ? {
        status: status as ApplicationStatus
      } : undefined,
      select: {
        email: true,
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

    const emails = applications.map(app => ({
      student: app.email,
      parent: app.user.profile?.parentEmail || ''
    }))

    return NextResponse.json({
      emails,
      count: emails.length
    })

  } catch (error) {
    console.error('Email list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email list' },
      { status: 500 }
    )
  }
} 