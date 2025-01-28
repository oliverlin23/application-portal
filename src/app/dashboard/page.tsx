import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, UserCircle, DollarSign } from "lucide-react"
import Link from "next/link"
import { PrismaClient } from '@prisma/client'
import { cn } from "@/lib/utils"

const prisma = new PrismaClient()

const formatStatus = (status: string) => {
  return status
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  // Fetch application with confirmation and financial aid details
  const application = await prisma.application.findUnique({
    where: { userId: session?.user?.id },
    select: { 
      status: true,
      programConfirmation: {
        select: {
          financialAidRequest: true
        }
      },
      FinancialAidApplication: {
        select: {
          status: true
        }
      }
    }
  })

  const statusColors = {
    IN_PROGRESS: "text-yellow-500",
    SUBMITTED: "text-blue-500",
    ACCEPTED: "text-green-500",
    WAITLISTED: "text-orange-500",
    DENIED: "text-red-500",
    WITHDRAWN: "text-gray-500",
    CONFIRMED: "text-green-500",
    COMPLETED: "text-green-500"
  }

  const statusText = application?.status || "IN_PROGRESS"
  const showFinancialAid = application?.status === "CONFIRMED" && 
                          application?.programConfirmation?.financialAidRequest === true

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-6">
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

        {showFinancialAid && (
            <Card className="p-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Financial Aid Application</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {application?.FinancialAidApplication ? (
                    <span className={
                      application.FinancialAidApplication.status === 'PENDING' ? 'text-yellow-500' :
                      application.FinancialAidApplication.status === 'APPROVED' ? 'text-green-500' :
                      'text-red-500'
                    }>
                      {formatStatus(application.FinancialAidApplication.status || 'PENDING')}
                    </span>
                  ) : (
                    <span className="text-yellow-500">Not Submitted</span>
                  )}
                </div>
                <div className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Submit your financial aid application
                </p>
                <Button asChild className="rounded-full w-full bg-blue-500 hover:bg-blue-600 text-white mt-6">
                  <Link href="/dashboard/financial-aid">
                    {application?.FinancialAidApplication ? 'View Application' : 'Start Application'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

        {(application?.status === 'ACCEPTED' || application?.status === 'CONFIRMED' || application?.status === 'COMPLETED') && (
          <Card className="p-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Program Confirmation</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", {
                "text-yellow-500": application?.status === 'ACCEPTED',
                "text-green-500": application?.status === 'CONFIRMED' || application?.status === 'COMPLETED'
              })}>
                {application?.status === 'CONFIRMED' || application?.status === 'COMPLETED' ? 'Completed' : 'Required Action'}
              </div>
              <div className="h-2" />
              <p className="text-xs text-muted-foreground">
                Complete your program confirmation form by July 15th
              </p>
              <Button asChild className={cn("rounded-full w-full text-white mt-6", {
                "bg-yellow-500 hover:bg-yellow-600": application?.status === 'ACCEPTED',
                "bg-green-500 hover:bg-green-600": application?.status === 'CONFIRMED' || application?.status === 'COMPLETED'
              })}>
                <Link href="/dashboard/confirmation">{application?.status === 'CONFIRMED' || application?.status === 'COMPLETED' ? 'View Form' : 'Complete Form'}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 