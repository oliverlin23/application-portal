"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { LayoutDashboard, FileText, UserCircle } from "lucide-react"

export function DashboardNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

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
            ? "bg-gray-300 hover:bg-gray-200 hover:underline hover:underline-offset-4"
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
            ? "bg-gray-300 hover:bg-gray-200 hover:underline hover:underline-offset-4"
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
            ? "bg-gray-300 hover:bg-gray-200 hover:underline hover:underline-offset-4"
            : "hover:bg-gray-200 hover:text-foreground hover:underline hover:underline-offset-4",
          "justify-start"
        )}
      >
        <UserCircle className="mr-2 h-4 w-4" />
        Profile
      </Link>
    </nav>
  )
} 