'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText } from "lucide-react"

const confirmationFormSchema = z.object({
  studentName: z.string().min(2, "Student name is required"),
  parentName: z.string().min(2, "Parent/guardian name is required"),
  emergencyContact: z.string().min(10, "Emergency contact number is required"),
  dietaryRestrictions: z.string(),
  medicalConditions: z.string(),
  photoRelease: z.boolean(),
  liabilityWaiver: z.boolean(),
  paymentMethod: z.enum(["PAYPAL", "CHECK", "FINANCIAL_AID"]),
  financialAidRequest: z.boolean(),
  additionalNotes: z.string(),
})

type FormData = z.infer<typeof confirmationFormSchema>

export default function ProgramConfirmationPage() {
  const router = useRouter()
  const { status } = useSession()
  const [error, setError] = useState('')
  const [application, setApplication] = useState<{ status?: string } | null>(null)
  const [forms] = useState([
    { name: 'Program Liability Waiver', path: '/forms/liability-waiver.pdf' },
    { name: 'Medical Release Form', path: '/forms/medical-release.pdf' },
    { name: 'Program Guidelines', path: '/forms/program-guidelines.pdf' },
  ])

  const form = useForm<FormData>({
    resolver: zodResolver(confirmationFormSchema),
    defaultValues: {
      studentName: '',
      parentName: '',
      emergencyContact: '',
      dietaryRestrictions: '',
      medicalConditions: '',
      photoRelease: false,
      liabilityWaiver: false,
      paymentMethod: 'PAYPAL',
      financialAidRequest: false,
      additionalNotes: '',
    },
  })

  useEffect(() => {
    async function checkEligibility() {
      try {
        const response = await fetch('/api/application')
        if (response.ok) {
          const data = await response.json()
          setApplication(data)
          if (data?.status !== 'ACCEPTED') {
            router.push('/dashboard')
          }
        }
      } catch (error) {
        console.error(error)
        setError('Failed to verify eligibility')
      }
    }
    
    if (status === 'unauthenticated') {
      router.push('/signin')
    } else if (status === 'authenticated') {
      checkEligibility()
    }
  }, [status, router])

  async function onSubmit(values: FormData) {
    try {
      const response = await fetch('/api/confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('Failed to submit confirmation')
      }

      router.push('/dashboard')
    } catch (error) {
      console.error(error)
      setError('Failed to submit confirmation form. Please try again.')
    }
  }

  if (status === 'loading' || !application) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Program Confirmation</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Program Information</CardTitle>
          <CardDescription>
            Important details about the Yale Summer Debate Program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">When</h3>
                <p className="text-sm text-muted-foreground">
                  August 18th - August 22nd<br />
                  10:00 AM - 4:00 PM daily<br />
                  <span className="text-yellow-600">Please do not arrive more than 15 minutes early</span>
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Where</h3>
                <p className="text-sm text-muted-foreground">
                  Linsly-Chittenden Hall<br />
                  63 High St, New Haven, CT 06511<br />
                  <span className="italic">Location subject to change</span>
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Check-in & Check-out</h3>
                <p className="text-sm text-muted-foreground">
                  Room 102, Linsly-Chittenden Hall<br />
                  Students must check in/out with an adult coach<br />
                  Parent/guardian check-out not required unless specified
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Materials & Meals</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Bring:</strong> Paper, pens, and water bottle<br />
                  <strong>Provided:</strong> Catered lunch and light breakfast<br />
                  Students may bring their own meals if preferred
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-2">Payment Instructions</h3>
              <p className="text-sm text-muted-foreground">
                Program fee: $599 (Financial aid available)<br />
                Payment due: July 15th, 2024<br />
                Method: PayPal invoice (PayPal account not required)<br />
                For payment assistance or alternative methods, contact:<br />
                <a href="mailto:yalesummerdebateprogram@gmail.com" className="text-blue-600 hover:underline">
                  yalesummerdebateprogram@gmail.com
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Program Forms</CardTitle>
          <CardDescription>
            Please review and download these important program documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {forms.map((form, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{form.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(form.path, '_blank')}
                >
                  View PDF
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Program Confirmation Form</CardTitle>
          <CardDescription>
            Please complete this form to confirm your participation in the Yale Summer Debate Program.
            This form must be completed by a parent or guardian. All consents and waivers below are legally binding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="studentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student&apos;s Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent/Guardian&apos;s Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Number</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dietaryRestrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Restrictions</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Please list any dietary restrictions or allergies"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medicalConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Conditions</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Please list any medical conditions or medications we should be aware of"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PAYPAL">PayPal</SelectItem>
                          <SelectItem value="CHECK">Check</SelectItem>
                          <SelectItem value="FINANCIAL_AID">Financial Aid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="financialAidRequest"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I would like to apply for financial aid
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="photoRelease"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I give permission for photos/videos of my child to be used for program purposes
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="liabilityWaiver"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I acknowledge and agree to the programs&apos; liability waiver and terms
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Any additional information you'd like us to know"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Submitting...' : 'Submit Confirmation'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 