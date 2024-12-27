import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await req.json()
    
    // Log the incoming data and user ID
    console.log('Updating profile for user:', session.user.id)
    console.log('Update data:', data)

    const profile = await prisma.profile.upsert({
      where: { 
        userId: session.user.id 
      },
      update: {
        name: data.name,
        email: data.email,
        parentEmail: data.parentEmail,
        phoneNumber: data.phoneNumber,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country || '',
        school: data.school,
        gradeLevel: data.gradeLevel,
      },
      create: {
        userId: session.user.id,
        name: data.name,
        email: data.email,
        parentEmail: data.parentEmail,
        phoneNumber: data.phoneNumber,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country || '',
        school: data.school,
        gradeLevel: data.gradeLevel,
        forms: [],
      },
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile', details: error }, 
      { status: 500 }
    )
  }
} 