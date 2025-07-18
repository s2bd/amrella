"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ReportDialog } from "@/components/report-dialog"
import { MoreHorizontal, Link, Share2, Bookmark, Flag, Edit, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PostActionsMenuProps {
  postId: string
  postUserId: string
  currentUserId?: string
  onEdit?: () => void
  onDelete?: () => void
}

export function PostActionsMenu({ postId, postUserId, currentUserId, onEdit, onDelete }: PostActionsMenuProps) {
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const isOwnPost = currentUserId === postUserId

  const copyPostLink = async () => {
    const postUrl = `${window.location.origin}/posts/${postId}`
    try {
      await navigator.clipboard.writeText(postUrl)
      toast({ title: "Link copied", description: "Post link copied to clipboard" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to copy link", variant: "destructive" })
    }
  }

  const sharePost = async () => {
    const postUrl = `${window.location.origin}/posts/${postId}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this post",
          url: postUrl,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      copyPostLink()
    }
  }

  const savePost = async () => {
    // TODO: Implement save post functionality
    toast({ title: "Coming soon", description: "Save post feature will be available soon" })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={copyPostLink}>
            <Link className="w-4 h-4 mr-2" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={sharePost}>
            <Share2 className="w-4 h-4 mr-2" />
            Share post
          </DropdownMenuItem>
          <DropdownMenuItem onClick={savePost}>
            <Bookmark className="w-4 h-4 mr-2" />
            Save post
          </DropdownMenuItem>
          
          {isOwnPost && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete post
              </DropdownMenuItem>
            </>
          )}
          
          {!isOwnPost && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setReportDialogOpen(true)} className="text-red-600">
                <Flag className="w-4 h-4 mr-2" />
                Report post
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportDialog
        reportedPostId={postId}
        reportedUserId={postUserId}
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
      />
    </>
  )
}