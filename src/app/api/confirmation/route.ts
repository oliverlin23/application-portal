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

async function validateSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function POST(req: Request) {
  try {
    const session = await validateSession()
    const data = await req.json()
    console.log('Received confirmation data:', data)
    const validatedData = confirmationSchema.parse(data)
    console.log('Validated confirmation data:', validatedData)

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
    console.log('Found application:', application)

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
    console.log('Created/Updated confirmation:', confirmation)

    // Send confirmation email
    await sendConfirmationEmail(
      application.email ?? '',
      application.user.profile?.parentEmail ?? '',
      validatedData.studentName,
      validatedData.parentName,
      validatedData
    )

    // Update application status to CONFIRMED
    const updatedApplication = await prisma.application.update({
      where: { id: application.id },
      data: { status: 'CONFIRMED' }
    })

    return NextResponse.json({ 
      confirmation, 
      application: updatedApplication
    })
  } catch (error) {
    console.error('Confirmation error:', error instanceof Error ? error.message : 'Unknown error')
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: error.errors[0].message
      }, { status: 400 })
    }

    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to submit confirmation'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await validateSession()
    
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
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch confirmation' },
      { status: 500 }
    )
  }
} 