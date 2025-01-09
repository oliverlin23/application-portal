'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminSettings() {
  const [confirmText, setConfirmText] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    if (confirmText !== 'DELETE ALL APPLICATIONS') {
      setError('Please type the confirmation text exactly')
      return
    }

    try {
      const res = await fetch('/api/admin/settings/delete-applications', {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete applications')
      }

      setSuccess('All applications have been deleted')
      setIsOpen(false)
      setConfirmText('')
      // Invalidate all relevant queries
      await queryClient.invalidateQueries({ queryKey: ['applications'] })
      await queryClient.invalidateQueries({ queryKey: ['adminStats'] })
    } catch (error) {
      console.error(error)
      setError('Failed to delete applications')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 mb-2">Danger Zone</CardTitle>
          <CardDescription className="text-red-700">
            These actions are irreversible. Please proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete All Applications</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete All Applications</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete all applications
                  and their associated data.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-gray-500">
                  Please type <span className="font-mono font-bold">DELETE ALL APPLICATIONS</span> to confirm.
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type confirmation text..."
                  className="font-mono"
                />
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={confirmText !== 'DELETE ALL APPLICATIONS'}
                >
                  Delete All Applications
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 