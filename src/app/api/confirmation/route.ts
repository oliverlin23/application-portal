import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const confirmationSchema = z.object({
  studentName: z.string().min(2),
  parentName: z.string().min(2),
  emergencyContact: z.string().min(10),
  dietaryRestrictions: z.string(),
  medicalConditions: z.string(),
  photoRelease: z.boolean(),
  liabilityWaiver: z.boolean(),
  paymentMethod: z.enum(["PAYPAL", "CHECK", "FINANCIAL_AID"]),
  financialAidRequest: z.boolean(),
  additionalNotes: z.string(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user has an accepted application
    const application = await prisma.application.findUnique({
      where: { userId: session.user.id },
    })

    if (!application || application.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Only accepted applications can submit confirmation forms' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = confirmationSchema.parse(body)

    // Create or update the confirmation form
    const confirmation = await prisma.programConfirmation.upsert({
      where: { applicationId: application.id },
      create: {
        applicationId: application.id,
        ...validatedData,
        submittedAt: new Date(),
      },
      update: {
        ...validatedData,
        submittedAt: new Date(),
      },
    })

    return NextResponse.json(confirmation)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Confirmation submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit confirmation' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const application = await prisma.application.findUnique({
      where: { userId: session.user.id },
      include: {
        programConfirmation: true,
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json(application.programConfirmation)
  } catch (error) {
    console.error('Confirmation fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch confirmation' },
      { status: 500 }
    )
  }
} 