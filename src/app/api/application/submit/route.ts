import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { ApplicationStatus } from '@prisma/client'
import { sendApplicationNotification } from '@/lib/mail'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const application = await prisma.application.findUnique({
      where: { userId: session.user.id },
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
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Validate required fields
    const requiredFields = [
      'name',
      'email',
      'school',
      'gradeLevel',
      'yearsOfExperience',
      'numTournaments',
      'debateExperience',
      'interestEssay',
      'selfAptitudeAssessment',
    ]

    const missingFields = requiredFields.filter(
      field => !application[field as keyof typeof application]
    )

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          fields: missingFields,
        },
        { status: 400 }
      )
    }

    const updatedApplication = await prisma.application.update({
      where: { userId: session.user.id },
      data: {
        status: ApplicationStatus.SUBMITTED,
      },
    })

    // Send notification emails
    await sendApplicationNotification(
      application.email ?? '',
      application.user.profile?.parentEmail ?? '',
      application.name ?? '',
      ApplicationStatus.SUBMITTED
    )

    return NextResponse.json(updatedApplication)
  } catch (error) {
    console.error('Application submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
} 