import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all applications with related data
    const applications = await prisma.application.findMany({
      include: {
        user: {
          select: {
            profile: {
              select: {
                parentEmail: true,
                phoneNumber: true,
                address: true,
                city: true,
                state: true,
                zipCode: true,
                country: true
              }
            }
          }
        },
        programConfirmation: {
          select: {
            studentName: true,
            parentName: true,
            emergencyContact: true,
            dietaryRestrictions: true,
            medicalConditions: true,
            healthInsuranceCarrier: true,
            groupPolicyNumber: true,
            financialAidRequest: true,
            additionalNotes: true,
            submittedAt: true
          }
        },
        FinancialAidApplication: {
          select: {
            dependents: true,
            householdIncome: true,
            receivedAssistance: true,
            circumstances: true,
            status: true,
            submittedAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Create CSV header
    const headers = [
      // Application Info
      'Application ID',
      'Status',
      'Student Name',
      'Student Email',
      'School',
      'Grade Level',
      'UDL Student',
      'Years of Experience',
      'Number of Tournaments',
      'Created At',
      'Updated At',
      // Contact Info
      'Parent Email',
      'Phone Number',
      'Address',
      'City',
      'State',
      'Zip Code',
      'Country',
      // Essays
      'Debate Experience',
      'Interest Essay',
      'Self Assessment',
      // Program Confirmation
      'Confirmation Status',
      'Emergency Contact',
      'Dietary Restrictions',
      'Medical Conditions',
      'Health Insurance',
      'Policy Number',
      'Additional Notes',
      'Confirmation Date',
      // Financial Aid
      'Financial Aid Requested',
      'Financial Aid Status',
      'Dependents',
      'Household Income',
      'Receives Assistance',
      'Financial Circumstances',
      'Financial Aid Submission Date'
    ].join(',')

    // Convert applications to CSV rows
    const rows = applications.map(app => {
      const confirmation = app.programConfirmation
      const financialAid = app.FinancialAidApplication
      const profile = app.user.profile

      // Clean text fields to handle commas and quotes
      const cleanField = (field: string | null | undefined) => {
        if (!field) return ''
        const cleaned = field.replace(/"/g, '""') // Escape quotes
        return cleaned.includes(',') ? `"${cleaned}"` : cleaned // Wrap in quotes if contains comma
      }

      return [
        // Application Info
        app.id,
        app.status,
        cleanField(app.name),
        cleanField(app.email),
        cleanField(app.school),
        cleanField(app.gradeLevel),
        app.udlStudent ? 'Yes' : 'No',
        cleanField(app.yearsOfExperience),
        cleanField(app.numTournaments),
        app.createdAt,
        app.updatedAt,
        // Contact Info
        cleanField(profile?.parentEmail),
        cleanField(profile?.phoneNumber),
        cleanField(profile?.address),
        cleanField(profile?.city),
        cleanField(profile?.state),
        cleanField(profile?.zipCode),
        cleanField(profile?.country),
        // Essays
        cleanField(app.debateExperience),
        cleanField(app.interestEssay),
        cleanField(app.selfAptitudeAssessment),
        // Program Confirmation
        confirmation ? 'Submitted' : 'Not Submitted',
        cleanField(confirmation?.emergencyContact),
        cleanField(confirmation?.dietaryRestrictions),
        cleanField(confirmation?.medicalConditions),
        cleanField(confirmation?.healthInsuranceCarrier),
        cleanField(confirmation?.groupPolicyNumber),
        cleanField(confirmation?.additionalNotes),
        confirmation?.submittedAt || '',
        // Financial Aid
        confirmation?.financialAidRequest ? 'Yes' : 'No',
        cleanField(financialAid?.status),
        cleanField(financialAid?.dependents),
        cleanField(financialAid?.householdIncome),
        financialAid?.receivedAssistance ? 'Yes' : 'No',
        cleanField(financialAid?.circumstances),
        financialAid?.submittedAt || ''
      ].join(',')
    })

    // Combine header and rows
    const csv = [headers, ...rows].join('\n')

    // Return CSV with appropriate headers
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="applications-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export applications' },
      { status: 500 }
    )
  }
} 