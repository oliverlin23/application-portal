import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate input
    if (!body || !body.email || !body.password) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 })
    }

    const { name, email, password } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'Email already registered'
      }, { status: 400 })
    }
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with profile
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profile: {
          create: {
            name: name || '',
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
            forms: [],
          }
        }
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create account'
    }, { status: 500 })
  }
}

