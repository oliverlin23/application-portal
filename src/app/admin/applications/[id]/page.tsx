'use client'

import { use } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ApplicationStatus } from '@prisma/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
interface ApplicationDetail {
  id: string
  name: string
  email: string
  school: string
  gradeLevel: string
  experience: string
  status: ApplicationStatus
  createdAt: string
  user: {
    profile: {
      parentEmail: string
      phoneNumber: string
      address: string
      city: string
      state: string
      zipCode: string
      country: string
    }
  }
}

export default function ApplicationDetail({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: application, isLoading } = useQuery<ApplicationDetail>({
    queryKey: ['application', id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/applications/${id}`)
      if (!res.ok) throw new Error('Failed to fetch application')
      return res.json()
    }
  })

  if (isLoading) return <div>Loading application details...</div>
  if (!application) return <div>Application not found</div>

  const updateStatus = async (newStatus: ApplicationStatus) => {
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error('Failed to update status')
      
      await queryClient.invalidateQueries({ queryKey: ['application', id] })
      await queryClient.invalidateQueries({ queryKey: ['applications'] })
      await queryClient.invalidateQueries({ queryKey: ['adminStats'] })
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Application Details</h2>
        <Button 
          variant="outline"
          onClick={() => router.back()}
        >
          Back to Applications
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Name:</span> {application.name}
            </div>
            <div>
              <span className="font-medium">Email:</span> {application.email}
            </div>
            <div>
              <span className="font-medium">School:</span> {application.school}
            </div>
            <div>
              <span className="font-medium">Grade Level:</span> {application.gradeLevel}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Parent Email:</span> {application.user.profile.parentEmail}
            </div>
            <div>
              <span className="font-medium">Phone:</span> {application.user.profile.phoneNumber}
            </div>
            <div>
              <span className="font-medium">Address:</span> {application.user.profile.address}
            </div>
            <div>
              <span className="font-medium">City:</span> {application.user.profile.city}
            </div>
            <div>
              <span className="font-medium">State:</span> {application.user.profile.state}
            </div>
            <div>
              <span className="font-medium">ZIP:</span> {application.user.profile.zipCode}
            </div>
            <div>
              <span className="font-medium">Country:</span> {application.user.profile.country}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{application.experience}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={application.status} 
              onValueChange={updateStatus}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="WAITLISTED">Waitlisted</SelectItem>
                <SelectItem value="DENIED">Denied</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 