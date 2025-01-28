import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { sendConfirmationEmail } from '@/lib/mail'

const confirmationSchema = z.object({
  studentName: z.string().min(2, "Student name is required"),
  parentName: z.string().min(2, "Parent/guardian name is required"),
  emergencyContact: z.string().min(10, "Emergency contact number is required"),
  dietaryRestrictions: z.string().optional().default(''),
  medicalConditions: z.string().optional().default(''),
  healthInsuranceCarrier: z.string().optional().default(''),
  groupPolicyNumber: z.string().optional().default(''),
  liabilityWaiver: z.boolean().refine((val) => val === true, {
    message: "Liability waiver consent is required"
  }),
  medicalRelease: z.boolean().refine((val) => val === true, {
    message: "Medical release consent is required"
  }),
  mediaRelease: z.boolean().refine((val) => val === true, {
    message: "Media release consent is required"
  }),
  programGuidelines: z.boolean().refine((val) => val === true, {
    message: "Program guidelines consent is required"
  }),
  financialAidRequest: z.boolean().default(false),
  additionalNotes: z.string().optional().default(''),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const validatedData = confirmationSchema.parse(data)

    // Get the application to fetch emails
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
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Save confirmation data to database
    const confirmation = await prisma.programConfirmation.upsert({
      where: {
        applicationId: application.id
      },
      create: {
        ...validatedData,
        applicationId: application.id,
        submittedAt: new Date()
      },
      update: {
        ...validatedData,
        submittedAt: new Date()
      }
    })

    // Send confirmation email
    await sendConfirmationEmail(
      application.email ?? '',
      application.user.profile?.parentEmail ?? '',
      validatedData.studentName,
      validatedData.parentName,
      validatedData
    )

    // Update application status to CONFIRMED
    await prisma.application.update({
      where: { id: application.id },
      data: { status: 'CONFIRMED' }
    })

    return NextResponse.json(confirmation)
  } catch (error) {
    console.error('Confirmation submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit confirmation' },
      { status: 500 }
    )
  }
}

export async function GET() {
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