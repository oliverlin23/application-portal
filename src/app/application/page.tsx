'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type FormData = {
  name: string
  email: string
  school: string
  gradeLevel: string
  experience: string
}

export default function ApplicationForm() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { register, handleSubmit, setValue } = useForm<FormData>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchApplicationData = useCallback(async () => {
    const response = await fetch('/api/application')
    if (response.ok) {
      const data = await response.json()
      Object.keys(data).forEach((key) => {
        setValue(key as keyof FormData, data[key])
      })
    }
  }, [setValue])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
    } else if (status === 'authenticated' && session.user) {
      fetchApplicationData()
    }
  }, [status, session, router, fetchApplicationData])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        alert('Application saved successfully!')
      } else {
        throw new Error('Failed to save application')
      }
    } catch (error) {
      console.error('Error saving application:', error)
      alert('Failed to save application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Summer Debate Program Application</h1>
      <p className="mb-4">User ID: {session?.user?.id}</p>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg">
        <div className="mb-4">
          <label htmlFor="name" className="block mb-2">Name</label>
          <input
            type="text"
            id="name"
            {...register('name', { required: true })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2">Email</label>
          <input
            type="email"
            id="email"
            {...register('email', { required: true })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="school" className="block mb-2">School</label>
          <input
            type="text"
            id="school"
            {...register('school', { required: true })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="gradeLevel" className="block mb-2">Grade Level</label>
          <select
            id="gradeLevel"
            {...register('gradeLevel', { required: true })}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select Grade Level</option>
            <option value="9">9th Grade</option>
            <option value="10">10th Grade</option>
            <option value="11">11th Grade</option>
            <option value="12">12th Grade</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="experience" className="block mb-2">Debate Experience</label>
          <textarea
            id="experience"
            {...register('experience', { required: true })}
            className="w-full px-3 py-2 border rounded"
            rows={4}
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Application'}
        </button>
      </form>
    </div>
  )
}

