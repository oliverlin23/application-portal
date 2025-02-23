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

    // Fetch all financial aid applications with related data
    const applications = await prisma.financialAidApplication.findMany({
      include: {
        application: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                profile: {
                  select: {
                    school: true,
                    gradeLevel: true,
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
            }
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    // Create CSV header
    const headers = [
      // Student Info
      'Student Name',
      'Student Email',
      'School',
      'Grade Level',
      // Contact Info
      'Parent Email',
      'Phone Number',
      'Address',
      'City',
      'State',
      'Zip Code',
      'Country',
      // Financial Aid Info
      'Status',
      'Dependents',
      'Household Income',
      'Receives Assistance',
      'Will Provide Returns',
      'Circumstances',
      'Submitted At'
    ].join(',')

    // Convert applications to CSV rows
    const rows = applications.map(app => {
      const profile = app.application.user.profile

      // Clean text fields to handle commas and quotes
      const cleanField = (field: string | null | undefined) => {
        if (!field) return ''
        const cleaned = field.replace(/"/g, '""') // Escape quotes
        return cleaned.includes(',') ? `"${cleaned}"` : cleaned // Wrap in quotes if contains comma
      }

      return [
        // Student Info
        cleanField(app.application.user.name),
        cleanField(app.application.user.email),
        cleanField(profile?.school),
        cleanField(profile?.gradeLevel),
        // Contact Info
        cleanField(profile?.parentEmail),
        cleanField(profile?.phoneNumber),
        cleanField(profile?.address),
        cleanField(profile?.city),
        cleanField(profile?.state),
        cleanField(profile?.zipCode),
        cleanField(profile?.country),
        // Financial Aid Info
        app.status,
        cleanField(app.dependents),
        cleanField(app.householdIncome),
        app.receivedAssistance ? 'Yes' : 'No',
        app.willProvideReturns ? 'Yes' : 'No',
        cleanField(app.circumstances),
        new Date(app.submittedAt).toISOString()
      ].join(',')
    })

    // Combine header and rows
    const csv = [headers, ...rows].join('\n')

    // Return CSV with appropriate headers
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="financial-aid-applications-${new Date().toISOString().split('T')[0]}.csv"`
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