"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SearchDialog } from "@/components/search-dialog"
import { Home, Users, MessageCircle, Calendar, BookOpen, Bell, Search, Settings, LogOut, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function Navigation() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string>("user")

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await fetch("/api/notifications?unread=true")
      if (!response.ok) return []
      const data = await response.json()
      return data.notifications
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user)

      if (session?.user?.id) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
          setUserRole(profileData.role || "user")
        } else {
          console.error("Error fetching profile:", profileError)
          setUserRole("user")
        }
      }
    }
    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user)
      if (session?.user?.id) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profileData, error: profileError }) => {
            if (profileData) {
              setProfile(profileData)
              setUserRole(profileData.role || "user")
            } else {
              console.error("Error fetching profile:", profileError)
              setUserRole("user")
            }
          })
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const markNotificationsAsRead = async (notificationIds: string[]) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationIds, markAsRead: true }),
    })
  }
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  if (pathname === "/auth") return null

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/groups", icon: Users, label: "Groups" },
    { href: "/messages", icon: MessageCircle, label: "Messages" },
    { href: "/events", icon: Calendar, label: "Events" },
    { href: "/courses", icon: BookOpen, label: "Courses" },
    { href: "/forums", icon: MessageCircle, label: "Forums" },
    { href: "/admin", icon: Settings, label: "Admin", adminOnly: true },
    { href: "/support", icon: MessageCircle, label: "Support", adminOnly: true },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AM</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Amrella</span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative" onClick={() => setSearchOpen(true)}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search users, groups, courses..." 
                className="pl-10 cursor-pointer" 
                readOnly
              />
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems
              .filter((item) => !item.adminOnly || ["admin", "super_admin"].includes(userRole))
              .map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={pathname === item.href ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              ))}
          </div>

          {/* User Menu */}
          {user && (
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-4 h-4" />
                    {notifications && notifications.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
                        {notifications.length}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Notifications</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {notifications && notifications.length > 0 ? (
                        notifications.map((notification: any) => (
                          <div key={notification.id} className="p-3 border rounded-lg">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            {notification.content && (
                              <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-8">No new notifications</p>
                      )}
                    </div>
                  </ScrollArea>
                  {notifications && notifications.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markNotificationsAsRead(notifications.map((n: any) => n.id))}
                      className="w-full"
                    >
                      Mark all as read
                    </Button>
                  )}
                </DialogContent>
              </Dialog>
                  </Badge>
                )}
              </Button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || user.user_metadata?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {profile?.full_name?.charAt(0) || user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{profile?.full_name || user.user_metadata?.full_name || "User"}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.id}`} className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        
        <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      </div>
    </nav>
  )
}
