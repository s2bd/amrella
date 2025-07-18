"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { VerifiedBadge } from "@/components/verified-badge"
import { MapPin, Calendar, LinkIcon, Users, Heart, MessageCircle, UserPlus, UserMinus, Edit, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const supabase = createClientComponentClient()
  const queryClient = useQueryClient()

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        setCurrentUserId(session.user.id)
      }
    }
    getCurrentUser()
  }, [supabase])

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) throw new Error("Failed to fetch profile")
      return response.json()
    },
  })

  const { data: isFollowing } = useQuery({
    queryKey: ["following", userId],
    queryFn: async () => {
      if (!currentUserId || currentUserId === userId) return false
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", currentUserId)
        .eq("following_id", userId)
        .single()
      return !!data
    },
    enabled: !!currentUserId && currentUserId !== userId,
  })

  const followMutation = useMutation({
    mutationFn: async (action: "follow" | "unfollow") => {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: action === "follow" ? "POST" : "DELETE",
      })
      if (!response.ok) throw new Error(`Failed to ${action}`)
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["following", userId] })
      queryClient.invalidateQueries({ queryKey: ["profile", userId] })
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error("Failed to update profile")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] })
      setEditDialogOpen(false)
      toast({ title: "Success", description: "Profile updated successfully" })
    },
  })

  const startConversation = async () => {
    try {
      const response = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: userId }),
      })
      if (!response.ok) throw new Error("Failed to start conversation")
      const data = await response.json()
      window.location.href = `/messages?conversation=${data.conversationId}`
    } catch (error) {
      toast({ title: "Error", description: "Failed to start conversation", variant: "destructive" })
    }
  }

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

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const updates: any = {
      full_name: formData.get("full_name"),
      bio: formData.get("bio"),
      location: formData.get("location"),
      website: formData.get("website"),
    }

    const coverImageFile = formData.get("cover_image") as File
    if (coverImageFile && coverImageFile.size > 0) {
      try {
        updates.coverImage = await handleFileUpload(coverImageFile)
      } catch (error) {
        toast({ title: "Error", description: "Failed to upload cover image", variant: "destructive" })
        return
      }
    }

    const avatarImageFile = formData.get("avatar_image") as File
    if (avatarImageFile && avatarImageFile.size > 0) {
      try {
        updates.avatarImage = await handleFileUpload(avatarImageFile)
      } catch (error) {
        toast({ title: "Error", description: "Failed to upload profile picture", variant: "destructive" })
        return
      }
    }
    updateProfileMutation.mutate(updates)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  const { profile, posts, groups } = profileData || {}
  const isOwnProfile = currentUserId === userId

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Cover Image & Profile Header */}
      <Card className="mb-6">
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg relative">
          {profile?.cover_image && (
            <img
              src={`data:image/jpeg;base64,${Buffer.from(profile.cover_image).toString("base64")}`}
              alt="Cover"
              className="w-full h-full object-cover rounded-t-lg"
            />
          )}
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 -mt-16">
            <Avatar className="w-32 h-32 border-4 border-white">
              <AvatarImage src={profile?.avatar_url || "/placeholder-user.jpg"} />
              <AvatarFallback className="text-2xl">
                {profile?.full_name?.charAt(0) || profile?.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-2xl font-bold">{profile?.full_name || "Anonymous User"}</h1>
                <VerifiedBadge
                  isVerified={profile?.is_verified}
                  verificationType={profile?.verification_type}
                  size="md"
                />
              </div>

              {profile?.bio && <p className="text-gray-600 mb-3">{profile.bio}</p>}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                {profile?.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {profile.location}
                  </div>
                )}
                {profile?.website && (
                  <div className="flex items-center">
                    <LinkIcon className="w-4 h-4 mr-1" />
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Website
                    </a>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Joined {formatDistanceToNow(new Date(profile?.created_at), { addSuffix: true })}
                </div>
              </div>

              <div className="flex items-center space-x-6 mb-4">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{profile?.followers?.[0]?.count || 0}</span>
                  <span className="text-gray-500">followers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-medium">{profile?.following?.[0]?.count || 0}</span>
                  <span className="text-gray-500">following</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              {isOwnProfile ? (
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input id="full_name" name="full_name" defaultValue={profile?.full_name || ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" name="bio" defaultValue={profile?.bio || ""} rows={3} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" name="location" defaultValue={profile?.location || ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input id="website" name="website" type="url" defaultValue={profile?.website || ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cover_image">Cover Image</Label>
                        <Input id="cover_image" name="cover_image" type="file" accept="image/*" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="avatar_image">Profile Picture</Label>
                        <Input id="avatar_image" name="avatar_image" type="file" accept="image/*" />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={updateProfileMutation.isPending}>
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              ) : (
                <>
                  <Button
                    onClick={() => followMutation.mutate(isFollowing ? "unfollow" : "follow")}
                    disabled={followMutation.isPending}
                    variant={isFollowing ? "outline" : "default"}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4 mr-2" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                  <Button onClick={startConversation} variant="outline">
                    <Send className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content */}
      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <div className="space-y-4">
            {posts?.map((post: any) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <p className="text-gray-900 whitespace-pre-wrap mb-4">{post.content}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes_count || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {posts?.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">No posts yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="groups">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups?.map((group: any) => (
              <Card key={group.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={group.avatar_url || "/placeholder-user.jpg"} />
                      <AvatarFallback>{group.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{group.name}</h3>
                      <p className="text-sm text-gray-500">{group.member_count} members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {groups?.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">Not a member of any groups yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Contact Information</h3>
                  <p className="text-gray-600">{profile?.email}</p>
                </div>
                {profile?.bio && (
                  <div>
                    <h3 className="font-medium mb-2">About</h3>
                    <p className="text-gray-600">{profile.bio}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-medium mb-2">Member Since</h3>
                  <p className="text-gray-600">{new Date(profile?.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
