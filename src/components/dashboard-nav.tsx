"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { LayoutDashboard, FileText, UserCircle, ClipboardCheck } from "lucide-react"
import { useEffect, useState } from "react"

export function DashboardNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null)

  useEffect(() => {
    async function fetchApplicationStatus() {
      try {
        const response = await fetch('/api/application')
        if (response.ok) {
          const data = await response.json()
          setApplicationStatus(data?.status || null)
        }
      } catch (error) {
        console.error('Failed to fetch application status:', error)
      }
    }
    fetchApplicationStatus()
  }, [])

  return (
    <nav
      className={cn(
        "flex flex-col space-y-1 lg:pt-8",
        className
      )}
      {...props}
    >
      <Link
        href="/dashboard"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          pathname === "/dashboard"
            ? "bg-gray-300 hover:bg-gray-200 hover:underline hover:text-foreground hover:underline-offset-4"
            : "hover:bg-gray-200 hover:text-foreground hover:underline hover:underline-offset-4",
            "justify-start" 
        )}
      >
        <LayoutDashboard className="mr-2 h-4 w-4" />
        Overview
      </Link>
      <Link
        href="/dashboard/application"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          pathname === "/dashboard/application"
            ? "bg-gray-300 hover:bg-gray-200 hover:text-foreground hover:underline hover:underline-offset-4"
            : "hover:bg-gray-200 hover:text-foreground hover:underline hover:underline-offset-4",
          "justify-start"
        )}
      >
        <FileText className="mr-2 h-4 w-4" />
        Application
      </Link>
      <Link
        href="/dashboard/profile"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          pathname === "/dashboard/profile"
            ? "bg-gray-300 hover:bg-gray-200 hover:underline hover:underline-offset-4 hover:text-foreground"
            : "hover:bg-gray-200 hover:text-foreground hover:underline hover:underline-offset-4",
          "justify-start"
        )}
      >
        <UserCircle className="mr-2 h-4 w-4" />
        Profile
      </Link>
      {(applicationStatus === 'ACCEPTED' || applicationStatus === 'CONFIRMED' || applicationStatus === 'COMPLETED') && (
        <Link
          href="/dashboard/confirmation"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === "/dashboard/confirmation"
              ? "bg-gray-300 hover:bg-gray-200 hover:underline hover:underline-offset-4"
              : "hover:bg-gray-200 hover:underline hover:underline-offset-4",
            "justify-start",
            {
              "text-yellow-500": applicationStatus === 'ACCEPTED',
              "text-green-500": applicationStatus === 'CONFIRMED' || applicationStatus === 'COMPLETED'
            }
          )}
        >
          <ClipboardCheck className="mr-2 h-4 w-4" />
          Confirmation Form
        </Link>
      )}
    </nav>
  )
} 