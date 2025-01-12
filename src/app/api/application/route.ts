import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { ApplicationStatus } from '@prisma/client'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const application = await prisma.application.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error('Application fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      name,
      email,
      school,
      udlStudent,
      gradeLevel,
      yearsOfExperience,
      numTournaments,
      debateExperience,
      interestEssay,
      selfAptitudeAssessment,
    } = body

    const application = await prisma.application.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        name,
        email,
        school,
        udlStudent,
        gradeLevel,
        yearsOfExperience,
        numTournaments,
        debateExperience,
        interestEssay,
        selfAptitudeAssessment,
        status: ApplicationStatus.IN_PROGRESS,
      },
      update: {
        name,
        email,
        school,
        udlStudent,
        gradeLevel,
        yearsOfExperience,
        numTournaments,
        debateExperience,
        interestEssay,
        selfAptitudeAssessment,
      },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error('Application save error:', error)
    return NextResponse.json(
      { error: 'Failed to save application' },
      { status: 500 }
    )
  }
}

