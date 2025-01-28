import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const financialAidSchema = z.object({
  dependents: z.string().min(1, "Number of dependents is required"),
  householdIncome: z.string().min(1, "Household income is required"),
  receivedAssistance: z.boolean(),
  circumstances: z.string()
    .min(1, "Please describe your circumstances")
    .max(1000, "Description must be less than 1000 characters"),
  willProvideReturns: z.boolean().refine(val => val === true, {
    message: "You must agree to provide tax returns if requested"
  })
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    console.log('Received data:', data)
    const validatedData = financialAidSchema.parse(data)
    console.log('Validated data:', validatedData)

    // Get the application to verify eligibility
    const application = await prisma.application.findUnique({
      where: { userId: session.user.id },
      include: {
        programConfirmation: true,
        FinancialAidApplication: true
      }
    })
    console.log('Found application:', application)

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (application.status !== 'CONFIRMED' || !application.programConfirmation?.financialAidRequest) {
      return NextResponse.json({ error: 'Not eligible for financial aid' }, { status: 403 })
    }

    // Create or update financial aid application
    const financialAid = await prisma.financialAidApplication.upsert({
      where: {
        applicationId: application.id
      },
      create: {
        applicationId: application.id,
        dependents: validatedData.dependents,
        householdIncome: validatedData.householdIncome,
        receivedAssistance: validatedData.receivedAssistance,
        circumstances: validatedData.circumstances,
        willProvideReturns: validatedData.willProvideReturns,
        status: 'PENDING'
      },
      update: {
        dependents: validatedData.dependents,
        householdIncome: validatedData.householdIncome,
        receivedAssistance: validatedData.receivedAssistance,
        circumstances: validatedData.circumstances,
        willProvideReturns: validatedData.willProvideReturns,
        status: 'PENDING'
      }
    })
    console.log('Created/Updated financial aid:', financialAid)

    return NextResponse.json(financialAid)
  } catch (error) {
    console.error('Detailed error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit financial aid application' },
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
        FinancialAidApplication: true
      }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json(application.FinancialAidApplication)
  } catch (error) {
    console.error('Financial aid fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch financial aid application' },
      { status: 500 }
    )
  }
}
