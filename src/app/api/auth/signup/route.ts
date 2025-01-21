import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { ApplicationStatus } from '@prisma/client'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        applications: {
          create: {
            status: ApplicationStatus.IN_PROGRESS,
            name: '',
            email: email,
            school: '',
            gradeLevel: '',
            yearsOfExperience: '',
            numTournaments: '',
            debateExperience: '',
            interestEssay: '',
            selfAptitudeAssessment: '',
            udlStudent: false
          }
        },
        profile: {
          create: {
            name: '',
            email: email,
            parentEmail: '',
            phoneNumber: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            school: '',
            gradeLevel: '',
            forms: []
          }
        }
      }
    })

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

