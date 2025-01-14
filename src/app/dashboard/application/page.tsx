'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import debounce from 'lodash/debounce'
import { AlertCircle } from "lucide-react"
import { isProfileComplete, type Profile } from '@/lib/utils'
import { useToast } from "@/hooks/use-toast"

const applicationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  school: z.string().min(2, "School name must be at least 2 characters"),
  udlStudent: z.boolean().default(false),
  gradeLevel: z.string().refine((val) => ["6", "9", "10", "11", "12"].includes(val), {
    message: "Please select a valid grade level"
  }),
  yearsOfExperience: z.string().min(1, "Please specify years of experience"),
  numTournaments: z.string().min(1, "Please specify number of tournaments"),
  debateExperience: z.string()
    .min(50, "Please provide at least 50 character describing your debate experience")
    .max(1000, "Debate experience should not exceed 1000 characters"),
  interestEssay: z.string()
    .min(100, "Please provide at least 100 characters for your interest essay")
    .max(1000, "Interest essay should not exceed 1000 characters"),
  selfAptitudeAssessment: z.string()
    .min(50, "Please provide at least 50 character for your self-assessment")
    .max(500, "Self-assessment should not exceed 500 characters"),
})

type FormData = z.infer<typeof applicationSchema>

export default function ApplicationPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkProfile() {
      try {
        const response = await fetch('/api/profile')
        const data = await response.json()
        setProfile(data)
        
        if (!isProfileComplete(data)) {
          router.push('/dashboard/profile?redirect=application')
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    checkProfile()
  }, [router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!profile || !isProfileComplete(profile)) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile Required</CardTitle>
            <CardDescription>
              Please complete your profile before starting your application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Your profile information is required before you can access the application.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => router.push('/dashboard/profile?redirect=application')}
              className="mt-4"
            >
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <ApplicationForm />
}

function ApplicationForm() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { register, handleSubmit, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: '',
      email: '',
      school: '',
      udlStudent: false,
      gradeLevel: '',
      yearsOfExperience: '',
      numTournaments: '',
      debateExperience: '',
      interestEssay: '',
      selfAptitudeAssessment: '',
    }
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showSubmitAlert, setShowSubmitAlert] = useState(false)
  const [application, setApplication] = useState<{ status?: string } | null>(null)
  const { toast } = useToast()

  const isSubmitted = application?.status === 'SUBMITTED'

  const fetchApplicationData = useCallback(async () => {
    const response = await fetch('/api/application')
    if (response.ok) {
      const data = await response.json()
      setApplication(data)
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

  const debouncedSave = debounce(async (data: FormData) => {
    try {
      await fetch('/api/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }, 1000)

  const autoSave = useCallback((data: FormData) => {
    debouncedSave(data)
  }, [debouncedSave])

  // Watch form changes for auto-save
  useEffect(() => {
    const subscription = watch((data) => {
      if (data) autoSave(data as FormData)
    })
    return () => subscription.unsubscribe()
  }, [watch, autoSave])

  // Submit with validation
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setSubmitError('')

    try {
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

      toast({
        title: "Success!",
        description: "Your application has been submitted successfully. You will receive a confirmation email shortly.",
        variant: "default",
      })

      router.refresh()
      router.push('/dashboard')
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map(e => e.message).join('. ')
        toast({
          title: "Validation Error",
          description: errorMessage,
          variant: "destructive",
        })
        setSubmitError(errorMessage)
      } else {
        toast({
          title: "Error",
          description: (error as Error).message || "Failed to submit application",
          variant: "destructive",
        })
        setSubmitError((error as Error).message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') return <div>Loading...</div>
  if (status === 'unauthenticated') return null

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Summer Debate Program Application</CardTitle>
            <CardDescription>
              Please fill out all fields below. Your application will be automatically saved as you type. 
              Once you&apos;ve completed all of the sections, click the submit button at the bottom.
            </CardDescription>
          </CardHeader>
        </Card>

        {submitError && (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Basic contact and school information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  disabled={isSubmitted}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} disabled={isSubmitted} />
              </div>

              <div>
                <Label htmlFor="school">School</Label>
                <Input id="school" {...register('school')} disabled={isSubmitted} />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="udlStudent"
                  checked={watch('udlStudent')}
                  onCheckedChange={(checked: boolean) => {
                    setValue('udlStudent', checked)
                  }}
                  disabled={isSubmitted}
                />
                <Label htmlFor="udlStudent">I am a New Haven UDL student</Label>
              </div>

              <div>
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <Select
                  onValueChange={value => setValue('gradeLevel', value)}
                  value={watch('gradeLevel') || ''}
                  disabled={isSubmitted}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Grade Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">Middle School</SelectItem>
                    <SelectItem value="9">9th Grade</SelectItem>
                    <SelectItem value="10">10th Grade</SelectItem>
                    <SelectItem value="11">11th Grade</SelectItem>
                    <SelectItem value="12">12th Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Debate Background</CardTitle>
              <CardDescription>
                Tell us about your debate experience and tournament participation. This information will only be used to match you with an appropriate debate lab, and will not be used to determine your admission to the program.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="yearsOfExperience">Years of Debate Experience</Label>
                <Select
                  onValueChange={value => setValue('yearsOfExperience', value)}
                  value={watch('yearsOfExperience') || ''}
                  disabled={isSubmitted}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Years of Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No Experience</SelectItem>
                    <SelectItem value="<1">Less than 1 year</SelectItem>
                    <SelectItem value="1">1 year</SelectItem>
                    <SelectItem value="2">2 years</SelectItem>
                    <SelectItem value="3+">3+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="numTournaments">Number of Tournaments Attended</Label>
                <Select
                  onValueChange={value => setValue('numTournaments', value)}
                  value={watch('numTournaments') || ''}
                  disabled={isSubmitted}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Number of Tournaments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="1-2">1-2 tournaments</SelectItem>
                    <SelectItem value="3-5">3-5 tournaments</SelectItem>
                    <SelectItem value="6+">6+ tournaments</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="debateExperience">
                  Debate Experience
                  <span className="text-sm text-muted-foreground ml-2">
                    (minimum 50 characters)
                  </span>
                </Label>
                <Textarea
                  id="debateExperience"
                  {...register('debateExperience')}
                  rows={4}
                  placeholder="Describe your debate experience, including formats, achievements, and areas of focus"
                  disabled={isSubmitted}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Program Interest & Self-Assessment</CardTitle>
              <CardDescription>
                Share why you want to join the program and help us understand your current debate skills.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="interestEssay">
                  Why are you interested in this program?
                  <span className="text-sm text-muted-foreground ml-2">
                    (minimum 100 characters)
                  </span>
                </Label>
                <Textarea
                  id="interestEssay"
                  {...register('interestEssay')}
                  rows={4}
                  placeholder="Explain your motivation for joining the program and what you hope to achieve"
                  disabled={isSubmitted}
                />
              </div>

              <div>
                <Label htmlFor="selfAptitudeAssessment">
                  Please provide a self-assessment of your current debate skills, strengths, and areas for improvement.
                  <span className="text-sm text-muted-foreground ml-2">
                    (minimum 50 characters)
                  </span>
                </Label>
                <Textarea
                  id="selfAptitudeAssessment"
                  {...register('selfAptitudeAssessment')}
                  rows={4}
                  placeholder="Evaluate your current debate skills, strengths, and areas for improvement"
                  disabled={isSubmitted}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              {application?.status === 'SUBMITTED' ? (
                <Alert className="mt-4">
                  <AlertDescription>
                    Your application has been submitted and can no longer be edited.
                  </AlertDescription>
                </Alert>
              ) : showSubmitAlert ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Are you sure you want to submit? This action cannot be undone.
                  </AlertDescription>
                  <div className="mt-4 flex justify-end space-x-4">
                    <Button variant="outline" onClick={() => setShowSubmitAlert(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                      Confirm Submit
                    </Button>
                  </div>
                </Alert>
              ) : (
                <Button
                  onClick={() => setShowSubmitAlert(true)}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  Submit Application
                </Button>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}

