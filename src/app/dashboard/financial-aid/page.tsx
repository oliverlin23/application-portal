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
import { useToast } from "@/hooks/use-toast"

const financialAidSchema = z.object({
    dependents: z.string().min(1, "Number of dependents is required"),
    householdIncome: z.string().min(1, "Household income is required"),
    receivedAssistance: z.boolean(),
    circumstances: z.string()
      .min(1, "Please describe your circumstances")
      .max(1000, "Description must be less than 1000 characters"),
    willProvideReturns: z.boolean().refine(val => val === true, {
      message: "You must agree to provide tax returns if requested"
    })
})

type FormData = z.infer<typeof financialAidSchema>

type FinancialAidApplication = FormData & {
  status?: string;
}

export default function FinancialAidPage() {
  const router = useRouter()
  const { status } = useSession()
  const [error, setError] = useState('')
  const [isEligible, setIsEligible] = useState(false)
  const [application, setApplication] = useState<FinancialAidApplication | null>(null)
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(financialAidSchema),
    defaultValues: {
      dependents: "0",
      householdIncome: '',
      receivedAssistance: false,
      circumstances: '',
      willProvideReturns: false
    }
  })

  useEffect(() => {
    async function checkEligibility() {
      try {
        const [appResponse, confirmResponse, aidResponse] = await Promise.all([
          fetch('/api/application'),
          fetch('/api/confirmation'),
          fetch('/api/financial-aid')
        ])
        
        if (!appResponse.ok || !confirmResponse.ok) {
          router.push('/dashboard')
          return
        }

        const [appData, confirmData, aidData] = await Promise.all([
          appResponse.json(),
          confirmResponse.json(),
          aidResponse.json()
        ])

        setIsEligible(
          appData.status === 'CONFIRMED' && 
          confirmData?.financialAidRequest === true
        )

        if (aidData) {
          setApplication(aidData)
          form.reset({
            dependents: aidData.dependents,
            householdIncome: aidData.householdIncome,
            receivedAssistance: aidData.receivedAssistance,
            circumstances: aidData.circumstances,
            willProvideReturns: aidData.willProvideReturns
          })
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
  }, [status, router, form])

  async function onSubmit(values: FormData) {
    try {
      setError('')
      const response = await fetch('/api/financial-aid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || 'Failed to submit application')
        return
      }

      toast({
        title: "Success!",
        description: "Your financial aid application has been submitted successfully.",
        variant: "default",
      })

      router.refresh()
      router.push('/dashboard')
    } catch (error) {
      console.error('Submission error:', error)
      setError('Failed to submit financial aid application. Please try again.')
    }
  }

  const isReadOnly = application?.status === 'PENDING' || 
                    application?.status === 'APPROVED' || 
                    application?.status === 'DENIED'

  if (!isEligible) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertDescription>
              You are not eligible to apply for financial aid at this time.
              Financial aid applications are only available after program confirmation
              and requesting financial aid in the confirmation form.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Aid Application</CardTitle>
          <CardDescription>
            {isReadOnly ? (
              <>
                Your application is {application?.status?.toLowerCase()}. 
                {application?.status === 'PENDING' && " We will review it shortly."}
              </>
            ) : (
              "Please provide accurate information to help us assess your financial aid needs. All information will be kept confidential."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="dependents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Dependents</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field}
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="householdIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Combined Annual Household Income</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g. $50,000" 
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="receivedAssistance"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Have you received assistance from SSI, Medicaid, SNAP, Free School Lunch, 
                        LIHEAP, Lifeline, TANF, Section 8, or WIC in the last 12 months?
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="circumstances"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Circumstances</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Please describe any extenuating circumstances that you would like us to consider"
                        className="h-32"
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="willProvideReturns"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I would be willing to provide my most recent tax returns upon request
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {!isReadOnly && (
                <Button type="submit">Submit Application</Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 