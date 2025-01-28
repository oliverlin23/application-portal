'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface FinancialAidApplication {
  id: string
  dependents: string
  householdIncome: string
  receivedAssistance: boolean
  circumstances: string
  willProvideReturns: boolean
  status: string
  submittedAt: string
  application: {
    user: {
      name: string
      email: string
      profile: {
        school: string
        gradeLevel: string
        parentEmail: string
      }
    }
  }
}

export default function AdminFinancialAidPage() {
  const router = useRouter()
  const { status } = useSession()
  const [applications, setApplications] = useState<FinancialAidApplication[]>([])
  const [error, setError] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    async function fetchApplications() {
      try {
        const response = await fetch('/api/admin/financial-aid')
        if (!response.ok) {
          throw new Error('Failed to fetch applications')
        }
        const data = await response.json()
        setApplications(data)
      } catch (error) {
        console.error(error)
        setError('Failed to load financial aid applications')
      }
    }

    if (status === 'unauthenticated') {
      router.push('/signin')
    } else if (status === 'authenticated') {
      fetchApplications()
    }
  }, [status, router])

  async function updateStatus(applicationId: string, newStatus: string) {
    try {
      const response = await fetch('/api/admin/financial-aid', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationId,
          status: newStatus
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      setApplications(apps => apps.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ))

      toast({
        title: "Status Updated",
        description: "Financial aid application status has been updated.",
        variant: "default",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to update application status.",
        variant: "destructive",
      })
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Financial Aid Applications</h2>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardHeader>
              <CardTitle>{app.application.user.name}</CardTitle>
              <CardDescription>
                Submitted on {new Date(app.submittedAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">Contact Information</h3>
                    <p>Student Email: {app.application.user.email}</p>
                    <p>Parent Email: {app.application.user.profile.parentEmail}</p>
                    <p>School: {app.application.user.profile.school}</p>
                    <p>Grade: {app.application.user.profile.gradeLevel}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Financial Information</h3>
                    <p>Dependents: {app.dependents}</p>
                    <p>Household Income: {app.householdIncome}</p>
                    <p>Receives Assistance: {app.receivedAssistance ? 'Yes' : 'No'}</p>
                    <p>Will Provide Returns: {app.willProvideReturns ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold">Circumstances</h3>
                  <p className="whitespace-pre-wrap">{app.circumstances}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <Select
                    defaultValue={app.status}
                    onValueChange={(value) => updateStatus(app.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="DENIED">Denied</SelectItem>
                    </SelectContent>
                  </Select>

                  <p className={`font-semibold ${
                    app.status === 'APPROVED' ? 'text-green-600' :
                    app.status === 'DENIED' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    Status: {app.status}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 