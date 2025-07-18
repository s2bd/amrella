"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Upload } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface CreateGroupDialogProps {
  children?: React.ReactNode
}

export function CreateGroupDialog({ children }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const queryClient = useQueryClient()

  const createGroupMutation = useMutation({
    mutationFn: async (groupData: any) => {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(groupData),
      })
      if (!response.ok) throw new Error("Failed to create group")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      setOpen(false)
      setCoverImage(null)
      toast({ title: "Success", description: "Group created successfully" })
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create group", variant: "destructive" })
    },
  })

  const handleFileUpload = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) throw new Error("Upload failed")
    const result = await response.json()
    return `data:${result.data.type};base64,${result.data.blob}`
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    let coverImageData = null
    if (coverImage) {
      try {
        coverImageData = await handleFileUpload(coverImage)
      } catch (error) {
        toast({ title: "Error", description: "Failed to upload cover image", variant: "destructive" })
        return
      }
    }

    createGroupMutation.mutate({
      name: formData.get("name"),
      description: formData.get("description"),
      category: formData.get("category"),
      privacy: formData.get("privacy"),
      coverImage: coverImageData,
    })
  }

  const categories = ["Technology", "Business", "Education", "Health", "Arts", "Sports", "Entertainment", "Other"]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input id="name" name="name" placeholder="Enter group name" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Describe what your group is about"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="privacy">Privacy</Label>
            <Select name="privacy" defaultValue="public">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Anyone can join</SelectItem>
                <SelectItem value="private">Private - Invite only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cover_image">Cover Image (optional)</Label>
            <div className="flex items-center space-x-2">
              <Button type="button" variant="outline" asChild>
                <label className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                  />
                </label>
              </Button>
              {coverImage && (
                <span className="text-sm text-gray-600">{coverImage.name}</span>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createGroupMutation.isPending}>
              {createGroupMutation.isPending ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
