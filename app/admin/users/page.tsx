"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { VerifiedBadge } from "@/components/verified-badge"
import { Search, Edit } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "@/hooks/use-toast"

interface User {
  id: string
  full_name: string
  email: string
  avatar_url: string
  role: string
  is_verified: boolean
  verification_type: string
  status: string
  created_at: string
  joined_at: string
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    const checkAdminAccess = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/auth")
        return
      }

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

      if (!profile || !["admin", "super_admin"].includes(profile.role)) {
        router.push("/")
        return
      }
    }

    checkAdminAccess()
  }, [supabase, router])

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin-users", searchTerm, roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: searchTerm,
        role: roleFilter,
      })
      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) throw new Error("Failed to fetch users")
      return response.json()
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: async (data: { userId: string; updates: Partial<User> }) => {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update user")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      setEditDialogOpen(false)
      toast({ title: "Success", description: "User updated successfully" })
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" })
    },
  })

  const handleUpdateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedUser) return

    const formData = new FormData(e.currentTarget)
    const updates = {
      role: formData.get("role") as string,
      is_verified: formData.get("is_verified") === "true",
      verification_type: formData.get("verification_type") as string,
    }

    updateUserMutation.mutate({
      userId: selectedUser.id,
      updates,
    })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-800"
      case "admin":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600">Manage user accounts, roles, and verification status</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">Users</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="super_admin">Super Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {usersData?.users?.map((user: User) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.avatar_url || "/placeholder-user.jpg"} />
                      <AvatarFallback>{user.full_name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{user.full_name || "No name"}</h3>
                        <VerifiedBadge isVerified={user.is_verified} verificationType={user.verification_type} />
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getRoleColor(user.role)}>{user.role.replace("_", " ")}</Badge>
                        <span className="text-xs text-gray-500">
                          Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user)
                        setEditDialogOpen(true)
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <Avatar>
                  <AvatarImage src={selectedUser.avatar_url || "/placeholder-user.jpg"} />
                  <AvatarFallback>{selectedUser.full_name?.charAt(0) || selectedUser.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.full_name || "No name"}</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue={selectedUser.role}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_verified">Verification Status</Label>
                <Select name="is_verified" defaultValue={selectedUser.is_verified.toString()}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Not Verified</SelectItem>
                    <SelectItem value="true">Verified</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification_type">Verification Type</Label>
                <Select name="verification_type" defaultValue={selectedUser.verification_type || "individual"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="creator">Creator</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? "Updating..." : "Update User"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
