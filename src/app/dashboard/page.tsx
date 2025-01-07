import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, UserCircle } from "lucide-react"
import Link from "next/link"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const formatStatus = (status: string) => {
  return status
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  // Fetch application status
  const application = await prisma.application.findUnique({
    where: { userId: session?.user?.id },
    select: { status: true }
  })

  const statusColors = {
    NOT_STARTED: "text-black-500",
    IN_PROGRESS: "text-yellow-500",
    SUBMITTED: "text-blue-500",
    ACCEPTED: "text-green-500",
    WAITLISTED: "text-orange-500",
    DENIED: "text-red-500"
  }

  const statusText = application?.status || "NOT_STARTED"

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Application Status</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={statusColors[statusText]}>
                {formatStatus(statusText)}
              </span>
            </div>
            <div className="h-2" />
            <p className="text-xs text-muted-foreground">
              Track your application progress
            </p>
            <Button asChild className="rounded-full w-full bg-blue-500 hover:bg-blue-600 text-white mt-6">
              <Link href="/dashboard/application">View Application</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {session?.user?.name || 'Update Profile'}
            </div>
            <div className="h-2" />
            <p className="text-xs text-muted-foreground">
              Manage your personal information
            </p>
            <Button asChild className="rounded-full w-full bg-blue-500 hover:bg-blue-600 text-white mt-6">
              <Link href="/dashboard/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 