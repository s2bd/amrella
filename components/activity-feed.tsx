"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Share2, MoreHorizontal, ImageIcon, Video, FileText } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Post {
  id: string
  content: string
  created_at: string
  user_id: string
  likes_count: number
  comments_count: number
  type: "text" | "image" | "video" | "course"
  profiles: {
    full_name: string
    avatar_url: string
  }
}

export function ActivityFeed() {
  const [newPost, setNewPost] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const supabase = createClientComponentClient()

  const {
    data: posts,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error
      return data as Post[]
    },
  })

  const handleCreatePost = async () => {
    if (!newPost.trim()) return

    setIsPosting(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from("posts").insert({
      content: newPost,
      user_id: user?.id,
      type: "text",
    })

    if (!error) {
      setNewPost("")
      refetch()
    }
    setIsPosting(false)
  }

  const handleLike = async (postId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from("post_likes").upsert({
      post_id: postId,
      user_id: user?.id,
    })

    if (!error) {
      refetch()
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Photo
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="w-4 h-4 mr-2" />
                  Video
                </Button>
                <Button variant="ghost" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Article
                </Button>
              </div>
              <Button onClick={handleCreatePost} disabled={!newPost.trim() || isPosting}>
                {isPosting ? "Posting..." : "Post"}
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
                    <Avatar>
                      <AvatarImage src={post.profiles?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{post.profiles?.full_name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{post.profiles?.full_name || "Anonymous"}</p>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {post.type !== "text" && <Badge variant="secondary">{post.type}</Badge>}
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className="flex items-center space-x-2"
                    >
                      <Heart className="w-4 h-4" />
                      <span>{post.likes_count || 0}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments_count || 0}</span>
                    </Button>
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
