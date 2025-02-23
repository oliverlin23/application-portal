'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Card,
  CardContent,
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
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Download } from "lucide-react"

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
    name: string
    email: string
    school: string
    user: {
      profile: {
        parentEmail: string
      }
    }
  }
}

const StatusCounts = ({ counts }: { counts: Record<string, number> }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      {Object.entries(counts).map(([status, count]) => (
        <Card key={status}>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">
              {status.charAt(0) + status.slice(1).toLowerCase()}
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

export default function AdminFinancialAidPage() {
  const queryClient = useQueryClient()
  const [inputValue, setInputValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [status, setStatus] = useState('ALL')
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(inputValue)
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const response = await fetch('/api/admin/financial-aid/export')
      if (!response.ok) {
        throw new Error('Export failed')
      }
      
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch ? filenameMatch[1] : 'financial-aid-applications.csv'
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: "Error",
        description: "Failed to export applications",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const { data, isLoading } = useQuery({
    queryKey: ['financialAid', searchQuery, status],
    queryFn: async () => {
      const res = await fetch(`/api/admin/financial-aid?search=${searchQuery}&status=${status}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    }
  })

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

      await queryClient.invalidateQueries({ queryKey: ['financialAid'] })

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

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Financial Aid Applications</h2>
      </div>

      {!isLoading && data?.counts && <StatusCounts counts={data.counts} />}

      {isLoading ? (
        <div>Loading applications...</div>
      ) : (
        <>
          <div className="flex justify-between items-center gap-4">
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
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="DENIED">Denied</SelectItem>
                </SelectContent>
              </Select>
            </form>

            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export to CSV'}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Household Income</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.applications?.map((app: FinancialAidApplication) => (
                <TableRow key={app.id}>
                  <TableCell>{app.application.name}</TableCell>
                  <TableCell>{app.application.school}</TableCell>
                  <TableCell>{app.householdIncome}</TableCell>
                  <TableCell>
                    <Select
                      value={app.status}
                      onValueChange={(value) => updateStatus(app.id, value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="DENIED">Denied</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {new Date(app.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const dialog = document.createElement('dialog')
                        dialog.className = 'p-4 rounded-lg shadow-lg bg-white'
                        dialog.innerHTML = `
                          <div class="space-y-4">
                            <h3 class="text-lg font-bold">Application Details</h3>
                            <div>
                              <p class="font-semibold">Contact Information</p>
                              <p>Student Email: ${app.application.email}</p>
                              <p>Parent Email: ${app.application.user.profile.parentEmail}</p>
                            </div>
                            <div>
                              <p class="font-semibold">Financial Information</p>
                              <p>Dependents: ${app.dependents}</p>
                              <p>Household Income: ${app.householdIncome}</p>
                              <p>Receives Assistance: ${app.receivedAssistance ? 'Yes' : 'No'}</p>
                            </div>
                            <div>
                              <p class="font-semibold">Circumstances</p>
                              <p class="whitespace-pre-wrap">${app.circumstances}</p>
                            </div>
                            <button class="px-4 py-2 bg-gray-200 rounded" onclick="this.closest('dialog').close()">
                              Close
                            </button>
                          </div>
                        `
                        document.body.appendChild(dialog)
                        dialog.showModal()
                        dialog.addEventListener('close', () => {
                          document.body.removeChild(dialog)
                        })
                      }}
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