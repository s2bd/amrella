"use client"

import { useQuery } from "@tanstack/react-query"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

interface Group {
  id: string
  name: string
  description: string
  member_count: number
  avatar_url: string
  category: string
}

export function TrendingGroups() {
  const supabase = createClientComponentClient()

  const { data: groups, isLoading } = useQuery({
    queryKey: ["trending-groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .order("member_count", { ascending: false })
        .limit(5)

      if (error) throw error
      return data as Group[]
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trending Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
        <CardTitle className="text-lg">Trending Groups</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {groups?.map((group) => (
          <div key={group.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={group.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{group.name}</p>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <Users className="w-3 h-3 mr-1" />
                    {group.member_count}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {group.category}
                  </Badge>
                </div>
              </div>
            </div>
            <Button size="sm" variant="outline">
              Join
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
