import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
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

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 })
  }
}

