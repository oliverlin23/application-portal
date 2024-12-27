import { getServerSession } from 'next-auth/next'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, UserCircle } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

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
            <div className="text-2xl font-bold">In Progress</div>
            <div className="h-2" />
            <p className="text-xs text-muted-foreground">
              Track your application progress
            </p>
            <Button asChild className="border-2 border-gray-300 mt-6 w-full">
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
            <Button asChild className="border-2 border-gray-300 mt-6 w-full">
              <Link href="/dashboard/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 