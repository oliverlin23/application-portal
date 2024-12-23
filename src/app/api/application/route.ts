import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const application = await prisma.application.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    return NextResponse.json(application || {})
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await req.json()
    const application = await prisma.application.upsert({
      where: {
        userId: session.user.id,
      },
      update: data,
      create: {
        ...data,
        userId: session.user.id,
      },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error saving application:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

