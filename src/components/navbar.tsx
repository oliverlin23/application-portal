'use client'

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import Image from "next/image"

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Logo/Brand */}
          <div className="flex-shrink-0 ml-2">
            <Image 
              src="/icon.png" 
              alt="YSDP Logo" 
              width={32} 
              height={32} 
              className="h-8 w-auto"
            />
          </div>

          {/* Right side - Navigation Links */}
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="rounded-full hover:bg-blue-500 hover:text-white">Dashboard</Button>
                </Link>
                <Button 
                  onClick={() => signOut()}
                  variant="ghost"
                  className="rounded-full hover:bg-destructive hover:text-destructive-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/signin">
                  <Button variant="secondary" className="rounded-full border bg-blue-500 hover:bg-blue-600 text-white h-10">Sign In</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 