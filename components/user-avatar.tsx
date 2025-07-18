"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  user?: {
    avatar_url?: string | null
    full_name?: string | null
    email?: string
  }
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-10 h-10",
    xl: "w-12 h-12"
  }

  const fallbackSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base", 
    xl: "text-lg"
  }

  const getAvatarSrc = () => {
    if (user?.avatar_url) {
      // If it's a blob data URL, return as is
      if (user.avatar_url.startsWith('data:')) {
        return user.avatar_url
      }
      // If it's a regular URL, return as is
      return user.avatar_url
    }
    // Default placeholder
    return "/placeholder-user.jpg"
  }

  const getFallbackText = () => {
    if (user?.full_name) {
      return user.full_name.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return "U"
  }

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={getAvatarSrc()} alt={user?.full_name || "User"} />
      <AvatarFallback className={fallbackSizeClasses[size]}>
        {getFallbackText()}
      </AvatarFallback>
    </Avatar>
  )
}
