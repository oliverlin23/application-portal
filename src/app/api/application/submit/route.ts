import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if application exists and is complete
    const application = await prisma.application.findUnique({
      where: { userId: session.user.id },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'No application found' }, 
        { status: 400 }
      )
    }

    // Check required fields
    const requiredFields = ['name', 'email', 'school', 'gradeLevel', 'experience']
    const missingFields = requiredFields.filter(field => !application[field as keyof typeof application])

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Application incomplete', 
          missingFields 
        }, 
        { status: 400 }
      )
    }

    // Update application status to SUBMITTED
    const updatedApplication = await prisma.application.update({
      where: { userId: session.user.id },
      data: { status: 'SUBMITTED' },
    })

    return NextResponse.json(updatedApplication)
  } catch (error) {
    console.error('Error submitting application:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
} 