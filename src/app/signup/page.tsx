'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout'
import Link from 'next/link'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function SignUp() {
  const router = useRouter()
  const [error, setError] = useState('')
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError('')

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      router.push('/signin?success=Account created successfully')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create account')
    }
  }

  return (
    <Layout>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription className="text-gray-500">Sign up for a new account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. John Doe" className="border-gray-400 placeholder:text-gray-400"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} placeholder="name@example.com" className="border-gray-400 placeholder:text-gray-400"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} placeholder="Create your password..." className="border-gray-400 placeholder:text-gray-400"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} placeholder="Re-enter your password..." className="border-gray-400 placeholder:text-gray-400"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-1 text-xs">
                <p className="text-gray-600">Password must contain:</p>
                <ul className="space-y-0.5">
                  <li className={`flex items-center gap-1.5 ${
                    form.watch('password')?.length >= 8 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    <div className="w-3 h-3">
                      {form.watch('password')?.length >= 8 ? '✓' : '○'}
                    </div>
                    At least 8 characters
                  </li>
                  <li className={`flex items-center gap-1.5 ${
                    /[A-Z]/.test(form.watch('password') || '') ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    <div className="w-3 h-3">
                      {/[A-Z]/.test(form.watch('password') || '') ? '✓' : '○'}
                    </div>
                    At least one uppercase letter
                  </li>
                  <li className={`flex items-center gap-1.5 ${
                    /[a-z]/.test(form.watch('password') || '') ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    <div className="w-3 h-3">
                      {/[a-z]/.test(form.watch('password') || '') ? '✓' : '○'}
                    </div>
                    At least one lowercase letter
                  </li>
                  <li className={`flex items-center gap-1.5 ${
                    /[0-9]/.test(form.watch('password') || '') ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    <div className="w-3 h-3">
                      {/[0-9]/.test(form.watch('password') || '') ? '✓' : '○'}
                    </div>
                    At least one number
                  </li>
                </ul>
              </div>
              <div className="flex justify-center"></div>
              <Button 
                type="submit" 
                className="rounded-full w-full bg-blue-500 hover:bg-blue-600 text-white" 
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/signin" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </Layout>
  )
}

