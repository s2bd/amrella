"use client"

import { useQuery } from "@tanstack/react-query"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface User {
  id: string
  full_name: string
  avatar_url: string
  status: "online" | "away" | "busy"
  last_seen: string
}

export function OnlineUsers() {
  const supabase = createClientComponentClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ["online-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("status", "online").limit(10)

      if (error) throw error
      return data as User[]
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Online Now</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          Online Now
          <Badge variant="secondary" className="ml-2">
            {users?.length || 0}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {users?.map((user) => (
          <div key={user.id} className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>{user.full_name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.full_name}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
