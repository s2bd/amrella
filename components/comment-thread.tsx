"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VerifiedBadge } from "@/components/verified-badge"
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "@/hooks/use-toast"

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  parent_id?: string
  likes_count: number
  profiles: {
    full_name: string
    avatar_url: string
    is_verified: boolean
    verification_type: string
  }
  replies?: Comment[]
}

interface CommentThreadProps {
  postId: string
  comments: Comment[]
  currentUserId?: string
  onAddComment: (content: string, parentId?: string) => void
}

export function CommentThread({ postId, comments, currentUserId, onAddComment }: CommentThreadProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())

  const handleReply = (parentId: string) => {
    if (!replyContent.trim()) return
    onAddComment(replyContent, parentId)
    setReplyContent("")
    setReplyingTo(null)
  }

  const handleLikeComment = async (commentId: string) => {
    // TODO: Implement comment like functionality
    const newLikedComments = new Set(likedComments)
    if (likedComments.has(commentId)) {
      newLikedComments.delete(commentId)
    } else {
      newLikedComments.add(commentId)
    }
    setLikedComments(newLikedComments)
  }

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? "ml-8 mt-3" : "mb-4"}`}>
      <div className="flex space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.profiles?.avatar_url || "/placeholder-user.jpg"} />
          <AvatarFallback>{comment.profiles?.full_name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <p className="font-medium text-sm">{comment.profiles?.full_name}</p>
            <VerifiedBadge
              isVerified={comment.profiles?.is_verified || false}
              verificationType={comment.profiles?.verification_type}
            />
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-gray-900 mb-2">{comment.content}</p>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLikeComment(comment.id)}
              className={`text-xs ${likedComments.has(comment.id) ? "text-red-500" : "text-gray-500"}`}
            >
              <Heart className={`w-3 h-3 mr-1 ${likedComments.has(comment.id) ? "fill-current" : ""}`} />
              {comment.likes_count || 0}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="text-xs text-gray-500"
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              Reply
            </Button>
            <Button variant="ghost" size="sm" className="text-xs text-gray-500">
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </div>
          
          {replyingTo === comment.id && (
            <div className="mt-3 flex space-x-2">
              <Input
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleReply(comment.id)}
                className="text-sm"
              />
              <Button
                onClick={() => handleReply(comment.id)}
                disabled={!replyContent.trim()}
                size="sm"
              >
                Reply
              </Button>
            </div>
          )}
          
          {/* Render replies */}
          {comment.replies?.map((reply) => renderComment(reply, true))}
        </div>
      </div>
    </div>
  )

  // Group comments by parent/child relationship
  const topLevelComments = comments.filter(comment => !comment.parent_id)
  const repliesMap = comments.reduce((acc, comment) => {
    if (comment.parent_id) {
      if (!acc[comment.parent_id]) acc[comment.parent_id] = []
      acc[comment.parent_id].push(comment)
    }
    return acc
  }, {} as Record<string, Comment[]>)

  // Add replies to their parent comments
  const commentsWithReplies = topLevelComments.map(comment => ({
    ...comment,
    replies: repliesMap[comment.id] || []
  }))

  return (
    <div className="space-y-4">
      {commentsWithReplies.map(comment => renderComment(comment))}
    </div>
  )
}
