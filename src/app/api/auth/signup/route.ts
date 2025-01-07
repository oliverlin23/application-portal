import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/mail'

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

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with profile
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken,
        emailVerified: null,
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

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken)
      console.log('Verification email sent successfully')
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Optionally delete the created user if email fails
      await prisma.user.delete({
        where: { email }
      })
      return NextResponse.json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Please check your email to verify your account'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create account'
    }, { status: 500 })
  }
}

