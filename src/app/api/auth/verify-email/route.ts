import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Missing verification token' },
        { status: 400 }
      )
    }

    // Find user with matching verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification token' },
        { status: 400 }
      )
    }

    // Update user to mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null
      }
    })

    // Add this return statement
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to verify email' },
      { status: 500 }
    )
  }
}