"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VerifiedBadge } from "@/components/verified-badge"
import { Search, Users, MessageSquare, BookOpen, Calendar, FileText } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", query, activeTab],
    queryFn: async () => {
      if (!query.trim()) return null
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${activeTab}`)
      if (!response.ok) throw new Error("Search failed")
      return response.json()
    },
    enabled: query.length > 2,
  })

  useEffect(() => {
    if (!open) {
      setQuery("")
      setActiveTab("all")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users, groups, posts, and more..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {query.length > 2 && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="groups">Groups</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
              </TabsList>

              <div className="mt-4 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">Searching...</div>
                ) : results ? (
                  <div className="space-y-4">
                    <TabsContent value="all" className="space-y-4">
                      {/* Users */}
                      {results.users?.length > 0 && (
                        <div>
                          <h3 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            Users
                          </h3>
                          <div className="space-y-2">
                            {results.users.slice(0, 3).map((user: any) => (
                              <Link
                                key={user.id}
                                href={`/profile/${user.id}`}
                                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg"
                                onClick={() => onOpenChange(false)}
                              >
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={user.avatar_url || "/placeholder-user.jpg"} />
                                  <AvatarFallback>{user.full_name?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-1">
                                    <p className="font-medium text-sm">{user.full_name}</p>
                                    <VerifiedBadge
                                      isVerified={user.is_verified}
                                      verificationType={user.verification_type}
                                    />
                                  </div>
                                  {user.bio && <p className="text-xs text-gray-500 truncate">{user.bio}</p>}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Groups */}
                      {results.groups?.length > 0 && (
                        <div>
                          <h3 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            Groups
                          </h3>
                          <div className="space-y-2">
                            {results.groups.slice(0, 3).map((group: any) => (
                              <Link
                                key={group.id}
                                href={`/groups/${group.id}`}
                                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg"
                                onClick={() => onOpenChange(false)}
                              >
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={group.avatar_url || "/placeholder-user.jpg"} />
                                  <AvatarFallback>{group.name?.charAt(0) || "G"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{group.name}</p>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="secondary" className="text-xs">{group.category}</Badge>
                                    <span className="text-xs text-gray-500">{group.member_count} members</span>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Posts */}
                      {results.posts?.length > 0 && (
                        <div>
                          <h3 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Posts
                          </h3>
                          <div className="space-y-2">
                            {results.posts.slice(0, 3).map((post: any) => (
                              <div key={post.id} className="p-2 hover:bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={post.profiles?.avatar_url || "/placeholder-user.jpg"} />
                                    <AvatarFallback>{post.profiles?.full_name?.charAt(0) || "U"}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium">{post.profiles?.full_name}</span>
                                  <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-2">{post.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="users">
                      <div className="space-y-2">
                        {results.users?.map((user: any) => (
                          <Link
                            key={user.id}
                            href={`/profile/${user.id}`}
                            className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg"
                            onClick={() => onOpenChange(false)}
                          >
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={user.avatar_url || "/placeholder-user.jpg"} />
                              <AvatarFallback>{user.full_name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-1">
                                <p className="font-medium">{user.full_name}</p>
                                <VerifiedBadge
                                  isVerified={user.is_verified}
                                  verificationType={user.verification_type}
                                />
                              </div>
                              {user.bio && <p className="text-sm text-gray-500 line-clamp-1">{user.bio}</p>}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Similar content for other tabs */}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No results found</div>
                )}
              </div>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
