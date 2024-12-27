'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  parentEmail: z.string().email("Please enter a valid parent email"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Please enter a valid ZIP code"),
  school: z.string().min(1, "School is required"),
  gradeLevel: z.string().min(1, "Grade level is required"),
})

export default function ProfilePage() {
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<z.infer<typeof profileFormSchema> | null>(null)

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profile || {
      name: "",
      email: "",
      parentEmail: "",
      phoneNumber: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      school: "",
      gradeLevel: "",
    },
  })

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          if (data) {
            setProfile(data)
            form.reset(data)
          }
        }
      } catch (error) {
        setError('Failed to load profile')
        console.error('Error loading profile:', error)
      }
    }
    fetchProfile()
  }, [form])

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error('Failed to update profile')
      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      setIsEditing(false)
    } catch (error) {
      setError('Failed to update profile. Please try again.')
      console.error('Error updating profile:', error)
    }
  }

  if (!profile && !isEditing) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        <Button 
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
          className="hover:bg-gray-100"
        >
          <Pencil className="mr-2 h-4 w-4" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            {isEditing ? 'Update your personal information here.' : 'Your personal information.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parentEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="school"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gradeLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade Level</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full border-2 border-gray-300 hover:bg-gray-100"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium mb-2">Full Name</h3>
                <p className="text-sm text-muted-foreground">{profile?.name}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Email</h3>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Parent Email</h3>
                <p className="text-sm text-muted-foreground">{profile?.parentEmail}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Phone Number</h3>
                <p className="text-sm text-muted-foreground">{profile?.phoneNumber}</p>
              </div>
              <div className="col-span-2">
                <h3 className="font-medium mb-2">Address</h3>
                <p className="text-sm text-muted-foreground">{profile?.address}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">City</h3>
                <p className="text-sm text-muted-foreground">{profile?.city}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">State</h3>
                <p className="text-sm text-muted-foreground">{profile?.state}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">ZIP Code</h3>
                <p className="text-sm text-muted-foreground">{profile?.zipCode}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">School</h3>
                <p className="text-sm text-muted-foreground">{profile?.school}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Grade Level</h3>
                <p className="text-sm text-muted-foreground">{profile?.gradeLevel}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 