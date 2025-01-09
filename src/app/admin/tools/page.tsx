'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApplicationStatus } from '@prisma/client'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StatusBadge, getStatusColor } from "@/components/status-badge"
import { cn } from "@/lib/utils"

interface EmailList {
  emails: {
    student: string
    parent: string
  }[]
  count: number
}

export default function AdminTools() {
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'ALL'>('ALL')
  const [emailType, setEmailType] = useState<'student' | 'parent' | 'both'>('student')
  const [copied, setCopied] = useState(false)

  const { data: emailList, isLoading } = useQuery<EmailList>({
    queryKey: ['emailList', selectedStatus],
    queryFn: async () => {
      const res = await fetch(`/api/admin/tools/emails?status=${selectedStatus}`)
      if (!res.ok) throw new Error('Failed to fetch emails')
      return res.json()
    }
  })

  const getEmailString = () => {
    if (!emailList?.emails.length) return ''
    switch (emailType) {
      case 'student':
        return emailList.emails.map(e => e.student).join(', ')
      case 'parent':
        return emailList.emails.map(e => e.parent).join(', ')
      case 'both':
        return emailList.emails.map(e => `${e.student}, ${e.parent}`).join(', ')
    }
  }

  const handleCopy = async () => {
    const emailString = getEmailString()
    if (emailString) {
      await navigator.clipboard.writeText(emailString)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Admin Tools</h2>

      <Card>
        <CardHeader>
          <CardTitle>Email List Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Select 
              value={selectedStatus} 
              onValueChange={(value: ApplicationStatus | 'ALL') => setSelectedStatus(value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="font-medium">
                  All Applications
                </SelectItem>
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

            <Select value={emailType} onValueChange={(value: 'student' | 'parent' | 'both') => setEmailType(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select email type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student Emails</SelectItem>
                <SelectItem value="parent">Parent Emails</SelectItem>
                <SelectItem value="both">Both Emails</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={handleCopy}
              disabled={!emailList?.emails.length}
            >
              {copied ? 'Copied!' : 'Copy Emails'}
            </Button>
          </div>

          {isLoading ? (
            <div>Loading emails...</div>
          ) : emailList?.emails.length ? (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">
                {emailList.count} application{emailList.count !== 1 ? 's' : ''} found
              </p>
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm font-mono break-all">
                  {getEmailString()}
                </p>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                No emails found for the selected status.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 