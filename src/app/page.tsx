import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './api/auth/[...nextauth]/route'
import { Layout } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <Layout>
      <Card>
        <CardHeader>
          <CardTitle>Yale Summer Debate Program</CardTitle>
          <CardDescription>Application Portal</CardDescription>
        </CardHeader>
        <CardContent>
          {session?.user ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Welcome, {session.user.name || 'User'}!</h2>
              <p>Ready to start your application? Click the button below to begin.</p>
            </div>
          ) : (
            <p>Please sign in to access your application.</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {session?.user ? (
            <Button asChild className="rounded-full w-full bg-blue-500 hover:bg-blue-600 text-white">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild className="rounded-full w-full bg-blue-500 hover:bg-blue-600 text-white">
                <Link href="/signin">Sign In</Link>
              </Button>
              <div className="h-1"></div>
              <p className="text-sm text-center text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-blue-500 hover:underline">
                  Sign up
                </Link>
              </p>
            </>
          )}
        </CardFooter>
      </Card>
    </Layout>
  )
}

