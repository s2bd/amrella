"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, MessageSquare, AlertTriangle, Activity, TrendingUp, UserCheck } from "lucide-react"

interface AdminStats {
  totalUsers: number
  totalPosts: number
  totalGroups: number
  totalTickets: number
  pendingReports: number
  verifiedUsers: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [userRole, setUserRole] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()

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

      setUserRole(profile.role)
      await fetchStats()
      setLoading(false)
    }

    checkAdminAccess()
  }, [supabase, router])

  const fetchStats = async () => {
    try {
      const [
        { count: totalUsers },
        { count: totalPosts },
        { count: totalGroups },
        { count: totalTickets },
        { count: pendingReports },
        { count: verifiedUsers },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("groups").select("*", { count: "exact", head: true }),
        supabase.from("support_tickets").select("*", { count: "exact", head: true }),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_verified", true),
      ])

      setStats({
        totalUsers: totalUsers || 0,
        totalPosts: totalPosts || 0,
        totalGroups: totalGroups || 0,
        totalTickets: totalTickets || 0,
        pendingReports: pendingReports || 0,
        verifiedUsers: verifiedUsers || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Posts",
      value: stats?.totalPosts || 0,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Groups",
      value: stats?.totalGroups || 0,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Support Tickets",
      value: stats?.totalTickets || 0,
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Pending Reports",
      value: stats?.pendingReports || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Verified Users",
      value: stats?.verifiedUsers || 0,
      icon: UserCheck,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome to the Amrella admin panel</p>
        </div>
        <Badge variant={userRole === "super_admin" ? "default" : "secondary"}>
          {userRole === "super_admin" ? "Super Admin" : "Admin"}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="content">Content Moderation</TabsTrigger>
          <TabsTrigger value="support">Support Center</TabsTrigger>
          {userRole === "super_admin" && <TabsTrigger value="settings">Platform Settings</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Recent platform activity will be displayed here.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Response</span>
                    <Badge className="bg-green-100 text-green-800">Normal</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Storage</span>
                    <Badge className="bg-green-100 text-green-800">Available</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage users, roles, and verification status.</p>
              <div className="space-y-2">
                <a href="/admin/users" className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium">View All Users</div>
                  <div className="text-sm text-gray-600">Browse and manage user accounts</div>
                </a>
                <a
                  href="/admin/verification"
                  className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">Verification Requests</div>
                  <div className="text-sm text-gray-600">Review and approve verification requests</div>
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Review reported content and manage platform safety.</p>
              <div className="space-y-2">
                <a href="/admin/reports" className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Review Reports</div>
                  <div className="text-sm text-gray-600">Handle user reports and content violations</div>
                </a>
                <a href="/admin/posts" className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Content Overview</div>
                  <div className="text-sm text-gray-600">Browse all posts and comments</div>
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Support Center</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage support tickets and help users.</p>
              <div className="space-y-2">
                <a href="/admin/support" className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Support Tickets</div>
                  <div className="text-sm text-gray-600">View and respond to user support requests</div>
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {userRole === "super_admin" && (
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Configure platform-wide settings and preferences.</p>
                <div className="space-y-2">
                  <a href="/admin/settings" className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium">General Settings</div>
                    <div className="text-sm text-gray-600">Platform name, features, and configurations</div>
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
