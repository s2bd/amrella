"use client"

import type React from "react"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Flag } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ReportDialogProps {
  reportedUserId?: string
  reportedPostId?: string
  reportedCommentId?: string
  children?: React.ReactNode
}

export function ReportDialog({ reportedUserId, reportedPostId, reportedCommentId, children }: ReportDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const reportMutation = useMutation({
    mutationFn: async (data: { reason: string; description: string }) => {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedUserId,
          reportedPostId,
          reportedCommentId,
          reason: data.reason,
          description: data.description,
        }),
      })
      if (!response.ok) throw new Error("Failed to submit report")
      return response.json()
    },
    onSuccess: () => {
      toast({ title: "Report submitted", description: "Thank you for helping keep our community safe." })
      setOpen(false)
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit report", variant: "destructive" })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    reportMutation.mutate({
      reason: formData.get("reason") as string,
      description: formData.get("description") as string,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            <Flag className="w-4 h-4 mr-2" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for reporting</Label>
            <Select name="reason" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                <SelectItem value="copyright">Copyright violation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Please provide any additional context..."
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={reportMutation.isPending}>
              {reportMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
