'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import debounce from 'lodash/debounce'

const applicationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  school: z.string().min(2, "School name must be at least 2 characters"),
  gradeLevel: z.string().refine((val) => ["6", "9", "10", "11", "12"].includes(val), {
    message: "Please select a valid grade level"
  }),
  experience: z.string()
    .min(50, "Please provide at least 50 characters describing your experience")
    .max(1000, "Experience description should not exceed 1000 characters")
})

type FormData = z.infer<typeof applicationSchema>

export default function ApplicationForm() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { register, handleSubmit, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(applicationSchema)
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

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

  // Auto-save without validation
  const debouncedSave = useCallback(
    debounce(async (data: FormData) => {
      try {
        await fetch('/api/application', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, 1000),
    []
  )

  // Watch form changes for auto-save
  useEffect(() => {
    const subscription = watch((data) => {
      if (data) debouncedSave(data as FormData)
    })
    return () => subscription.unsubscribe()
  }, [watch, debouncedSave])

  // Submit with validation
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Validate data
      const validatedData = applicationSchema.parse(data)

      const response = await fetch('/api/application/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit application')
      }

      router.refresh()
      router.push('/dashboard')
    } catch (error) {
      if (error instanceof z.ZodError) {
        setSubmitError(error.errors.map(e => e.message).join('. '))
      } else {
        setSubmitError((error as Error).message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') return <div>Loading...</div>
  if (status === 'unauthenticated') return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Summer Debate Program Application</h1>
      </div>

      {submitError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <form className="max-w-lg">
        <p className="text-black-600 mb-6">
          Please fill out all fields below. Your application will be automatically saved as you type. 
          Once you&apos;ve completed all sections, click the submit button at the bottom of the form. 
          After submission, our team will review your application and contact you with next steps.
        </p>

        <div className="mb-4">
          <label htmlFor="name" className="block mb-2">Name</label>
          <input
            type="text"
            id="name"
            {...register('name')}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block mb-2">Email</label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="school" className="block mb-2">School</label>
          <input
            type="text"
            id="school"
            {...register('school')}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="gradeLevel" className="block mb-2">Grade Level</label>
          <select
            id="gradeLevel"
            {...register('gradeLevel')}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select Grade Level</option>
            <option value="6">Middle School</option>
            <option value="9">9th Grade</option>
            <option value="10">10th Grade</option>
            <option value="11">11th Grade</option>
            <option value="12">12th Grade</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="experience" className="block mb-2">
            Debate Experience
            <span className="text-sm text-gray-500 ml-2">
              (minimum 50 characters)
            </span>
          </label>
          <textarea
            id="experience"
            {...register('experience')}
            className="w-full px-3 py-2 border rounded"
            rows={4}
          ></textarea>
        </div>

        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="bg-blue-500 hover:bg-blue-600 text-white w-full mb-4 rounded-full"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </form>
    </div>
  )
}

