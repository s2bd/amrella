"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { HashtagMentionInput } from "@/components/hashtag-mention-input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Share2, MoreHorizontal, ImageIcon, Video } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { VerifiedBadge } from "@/components/verified-badge"
import { PostActionsMenu } from "@/components/post-actions-menu"
import { toast } from "@/hooks/use-toast"

interface Post {
  id: string
  content: string
  created_at: string
  user_id: string
  likes_count: number
  comments_count: number
  type: "text" | "image" | "video" | "course"
  media_data?: any
  media_type?: string
  media_filename?: string
  profiles: {
    full_name: string
    avatar_url: string
    is_verified: boolean
    verification_type: string
  }
}

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: {
    full_name: string
    avatar_url: string
    is_verified: boolean
    verification_type: string
  }
}
export function ActivityFeed() {
  const [newPost, setNewPost] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showComments, setShowComments] = useState<string | null>(null)
  const [newComment, setNewComment] = useState("")
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const supabase = createClientComponentClient()
  const queryClient = useQueryClient()
  const router = useRouter()

  // Get current user ID
  useState(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setCurrentUserId(session.user.id)
      }
    }
    getCurrentUser()
  }, [supabase])

  const {
    data: posts,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await fetch("/api/posts")
      if (!response.ok) throw new Error("Failed to fetch posts")
      const data = await response.json()
      return data.posts as Post[]
    },
  })

  const { data: comments } = useQuery({
    queryKey: ["comments", showComments],
    queryFn: async () => {
      if (!showComments) return []
      const response = await fetch(`/api/posts/${showComments}/comments`)
      if (!response.ok) throw new Error("Failed to fetch comments")
      const data = await response.json()
      return data.comments as Comment[]
    },
    enabled: !!showComments,
  })

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      })
      if (!response.ok) throw new Error("Failed to create post")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      setNewPost("")
      setSelectedFile(null)
      toast({ title: "Success", description: "Post created successfully" })
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create post", variant: "destructive" })
    },
  })

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      })
      if (!response.ok) throw new Error("Failed to like post")
      return response.json()
    },
    onSuccess: (data, postId) => {
      const newLikedPosts = new Set(likedPosts)
      if (data.liked) {
        newLikedPosts.add(postId)
      } else {
        newLikedPosts.delete(postId)
      }
      setLikedPosts(newLikedPosts)
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })

  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      if (!response.ok) throw new Error("Failed to add comment")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", showComments] })
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      setNewComment("")
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

  const handleCreatePost = async () => {
    if (!newPost.trim() && !selectedFile) return

    let mediaData = null
    let mediaType = null
    let mediaFilename = null
    let postType = "text"

    if (selectedFile) {
      try {
        mediaData = await handleFileUpload(selectedFile)
        mediaType = selectedFile.type
        mediaFilename = selectedFile.name
        postType = selectedFile.type.startsWith("image/")
          ? "image"
          : selectedFile.type.startsWith("video/")
            ? "video"
            : "text"
      } catch (error) {
        toast({ title: "Error", description: "Failed to upload file", variant: "destructive" })
        return
      }
    }

    createPostMutation.mutate({
      content: newPost,
      type: postType,
      mediaData,
      mediaType,
      mediaFilename,
    })
  }

  const handleLike = async (postId: string) => {
    likePostMutation.mutate(postId)
  }

  const handleComment = (postId: string) => {
    if (!newComment.trim()) return
    commentMutation.mutate({ postId, content: newComment })
  }

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <HashtagMentionInput 
              value={newPost} 
              onChange={setNewPost}
              placeholder="What's on your mind? Use #hashtags and @mentions"
            />
            {selectedFile && (
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">{selectedFile.name}</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                  Remove
                </Button>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <label>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Photo
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <label>
                    <Video className="w-4 h-4 mr-2" />
                    Video
                    <Input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </Button>
              </div>
              <Button
                onClick={handleCreatePost}
                disabled={(!newPost.trim() && !selectedFile) || createPostMutation.isPending}
              >
                {createPostMutation.isPending ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {posts?.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                {/* Post Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="cursor-pointer" onClick={() => router.push(`/profile/${post.user_id}`)}>
                      <AvatarImage src={post.profiles?.avatar_url || "/placeholder-user.jpg"} />
                      <AvatarFallback>{post.profiles?.full_name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-1">
                        <p 
                          className="font-medium cursor-pointer hover:underline" 
                          onClick={() => router.push(`/profile/${post.user_id}`)}
                        >
                          {post.profiles?.full_name || "Anonymous"}
                        </p>
                        <VerifiedBadge
                          isVerified={post.profiles?.is_verified || false}
                          verificationType={post.profiles?.verification_type}
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {post.type !== "text" && <Badge variant="secondary">{post.type}</Badge>}
                    <PostActionsMenu 
                      postId={post.id} 
                      postUserId={post.user_id}
                      currentUserId={currentUserId}
                    />
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
                  {post.media_data && post.media_type?.startsWith("image/") && (
                    <img
                      src={post.media_data || "/placeholder.svg"}
                      alt={post.media_filename || "Post image"}
                      className="mt-3 rounded-lg max-w-full h-auto"
                    />
                  )}
                  {post.media_data && post.media_type?.startsWith("video/") && (
                    <video src={post.media_data} controls className="mt-3 rounded-lg max-w-full h-auto" />
                  )}
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-2 ${likedPosts.has(post.id) ? "text-red-500" : ""}`}
                      disabled={likePostMutation.isPending}
                    >
                      <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? "fill-current" : ""}`} />
                      <span>{post.likes_count || 0}</span>
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-2"
                          onClick={() => setShowComments(post.id)}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments_count || 0}</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Comments</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {comments?.map((comment) => (
                            <div key={comment.id} className="flex space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={comment.profiles?.avatar_url || "/placeholder.svg"} />
                                <AvatarFallback>{comment.profiles?.full_name?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <p className="font-medium text-sm">{comment.profiles?.full_name}</p>
                                  <VerifiedBadge
                                    isVerified={comment.profiles?.is_verified || false}
                                    verificationType={comment.profiles?.verification_type}
                                  />
                                </div>
                                <p className="text-sm text-gray-900">{comment.content}</p>
                                <p className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleComment(post.id)}
                          />
                          <Button
                            onClick={() => handleComment(post.id)}
                            disabled={!newComment.trim() || commentMutation.isPending}
                          >
                            Post
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}