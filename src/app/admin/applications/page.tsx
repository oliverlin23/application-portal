'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApplicationStatus } from '@prisma/client'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { StatusBadge, getStatusColor } from "@/components/status-badge"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Application {
  id: string
  name: string
  email: string
  school: string
  status: ApplicationStatus
}

const StatusCounts = ({ counts }: { counts: Record<ApplicationStatus, number> }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {Object.entries(counts).map(([status, count]) => (
        <Card key={status}>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">
              <StatusBadge status={status as ApplicationStatus} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{count}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function AdminApplications() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [inputValue, setInputValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [status, setStatus] = useState('ALL')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(inputValue)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['applications', searchQuery, status],
    queryFn: async () => {
      const res = await fetch(`/api/admin/applications?search=${searchQuery}&status=${status}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    }
  })

  const updateStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error('Failed to update')
      
      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ['applications'] })
      await queryClient.invalidateQueries({ 
        queryKey: ['application', applicationId] 
      })
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  return (
    <div className="space-y-4">
      {!isLoading && data?.counts && <StatusCounts counts={data.counts} />}
      {isLoading ? (
        <div>Loading applications...</div>
      ) : (
        <>
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Search applications..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="max-w-sm"
            />
            <Button type="submit" variant="secondary">
              Search
            </Button>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                {Object.values(ApplicationStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.applications?.map((app: Application) => (
                <TableRow key={app.id}>
                  <TableCell>{app.name}</TableCell>
                  <TableCell>{app.email}</TableCell>
                  <TableCell>{app.school}</TableCell>
                  <TableCell>
                    <Select 
                      value={app.status} 
                      onValueChange={(value) => updateStatus(app.id, value as ApplicationStatus)}
                    >
                      <SelectTrigger className="border p-2 hover:bg-transparent">
                        <StatusBadge status={app.status} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ApplicationStatus).map((status) => (
                          <SelectItem 
                            key={status} 
                            value={status}
                            className={cn("flex items-center gap-2", getStatusColor(status))}
                          >
                            <StatusBadge status={status} />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/applications/${app.id}`)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  )
} 