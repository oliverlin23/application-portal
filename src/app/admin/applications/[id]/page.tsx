'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ApplicationStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from "@/components/status-badge"
import { use } from 'react'

interface Application {
  id: string
  name: string | null
  email: string | null
  school: string | null
  udlStudent: boolean
  gradeLevel: string | null
  yearsOfExperience: string | null
  numTournaments: string | null
  debateExperience: string | null
  interestEssay: string | null
  selfAptitudeAssessment: string | null
  status: ApplicationStatus
  updatedAt: Date
}

export default function ApplicationDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { id } = use(params)

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/admin/applications/${id}`)
        if (response.ok) {
          const data = await response.json()
          setApplication(data)
        }
      } catch (error) {
        console.error('Error fetching application:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchApplication()
  }, [id])

  const updateStatus = async (newStatus: string) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedApp = await response.json()
        setApplication(updatedApp)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateUdlStatus = async (isUdl: boolean) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ udlStudent: isUdl }),
      })

      if (response.ok) {
        const updatedApp = await response.json()
        setApplication(updatedApp)
      }
    } catch (error) {
      console.error('Error updating UDL status:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!application) return <div>Application not found</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Application Details</h1>
        <Button variant="outline" onClick={() => router.push('/admin/applications')}>
          Back to List
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Basic applicant details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium">Name</h3>
            <p className="break-words">{application.name || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-medium">Email</h3>
            <p className="break-all">{application.email || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-medium">School</h3>
            <p className="break-words">{application.school || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-medium">Grade Level</h3>
            <p>{application.gradeLevel || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Debate Experience</CardTitle>
          <CardDescription>Experience and tournament history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium">Years of Experience</h3>
              <p>{application.yearsOfExperience || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-medium">Tournaments Attended</h3>
              <p>{application.numTournaments || 'N/A'}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Debate Experience Details</h3>
            <p className="whitespace-pre-wrap break-words bg-muted p-4 rounded-md max-w-full overflow-hidden">
              {application.debateExperience || 'N/A'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Essays</CardTitle>
          <CardDescription>Program interest and self-assessment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Interest Essay</h3>
            <p className="whitespace-pre-wrap bg-muted p-4 rounded-md break-words">
              {application.interestEssay || 'N/A'}
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Self Assessment</h3>
            <p className="whitespace-pre-wrap bg-muted p-4 rounded-md break-words">
              {application.selfAptitudeAssessment || 'N/A'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Application Status</CardTitle>
          <CardDescription>Update application information</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="font-medium mb-2">Application Status</h3>
              <Select
                value={application.status}
                onValueChange={updateStatus}
                disabled={saving}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue>
                    <StatusBadge status={application.status} />
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ApplicationStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      <StatusBadge status={status} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <h3 className="font-medium mb-2">UDL Student</h3>
              <Select
                value={application.udlStudent.toString()}
                onValueChange={(value) => updateUdlStatus(value === 'true')}
                disabled={saving}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue>
                    {application.udlStudent ? 'Yes' : 'No'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {saving && <span className="text-muted-foreground">Saving...</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 