"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Plus, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "@/hooks/use-toast"

export default function ForumsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [newForumOpen, setNewForumOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: forums, isLoading } = useQuery({
    queryKey: ["forums", selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedCategory !== "all") params.set("category", selectedCategory)

      const response = await fetch(`/api/forums?${params}`)
      if (!response.ok) throw new Error("Failed to fetch forums")
      return response.json()
    },
  })

  const createForumMutation = useMutation({
    mutationFn: async (forumData: any) => {
      const response = await fetch("/api/forums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(forumData),
      })
      if (!response.ok) throw new Error("Failed to create forum")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forums"] })
      setNewForumOpen(false)
      toast({ title: "Success", description: "Forum created successfully" })
    },
  })

  const handleCreateForum = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    createForumMutation.mutate({
      name: formData.get("name"),
      description: formData.get("description"),
      category: formData.get("category"),
    })
  }

  const categories = ["all", "General", "Technology", "Business", "Education", "Support"]

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Forums</h1>
          <p className="text-gray-600">Join discussions and share knowledge</p>
        </div>
        <Dialog open={newForumOpen} onOpenChange={setNewForumOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Forum
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Forum</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateForum} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Forum Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setNewForumOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createForumMutation.isPending}>
                  {createForumMutation.isPending ? "Creating..." : "Create Forum"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category === "all" ? "All Categories" : category}
          </Button>
        ))}
      </div>

      {/* Forums List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {forums?.forums?.map((forum: any) => (
            <Card key={forum.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{forum.name}</h3>
                      <Badge variant="secondary">{forum.category}</Badge>
                      {forum.group && <Badge variant="outline">Group: {forum.group.name}</Badge>}
                    </div>

                    {forum.description && <p className="text-gray-600 mb-3">{forum.description}</p>}

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{forum.post_count || 0} posts</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={forum.creator?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{forum.creator?.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>Created by {forum.creator?.full_name}</span>
                      </div>

                      {forum.last_post_at && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            Last post {formatDistanceToNow(new Date(forum.last_post_at), { addSuffix: true })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button variant="outline" asChild>
                    <a href={`/forums/${forum.id}`}>View Topics</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {forums?.forums?.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No forums found</h3>
                <p className="text-gray-600 mb-4">Be the first to create a forum in this category.</p>
                <Button onClick={() => setNewForumOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Forum
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
