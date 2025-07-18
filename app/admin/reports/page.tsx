"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertTriangle, CheckCircle, XCircle, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "@/hooks/use-toast"

interface Report {
  id: string
  reason: string
  description: string
  status: string
  created_at: string
  reporter: {
    full_name: string
    avatar_url: string
  }
  reported_user: {
    full_name: string
    avatar_url: string
  }
  reported_post?: {
    content: string
    created_at: string
  }
  reported_comment?: {
    content: string
    created_at: string
  }
}

export default function AdminReportsPage() {
  const [selectedStatus, setSelectedStatus] = useState("pending")
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
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

  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-reports", selectedStatus],
    queryFn: async () => {
      const response = await fetch(`/api/admin/reports?status=${selectedStatus}`)
      if (!response.ok) throw new Error("Failed to fetch reports")
      const data = await response.json()
      return data.reports as Report[]
    },
  })

  const updateReportMutation = useMutation({
    mutationFn: async ({ reportId, status, action }: { reportId: string; status: string; action?: string }) => {
      const response = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status, action }),
      })
      if (!response.ok) throw new Error("Failed to update report")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] })
      toast({ title: "Success", description: "Report updated successfully" })
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update report", variant: "destructive" })
    },
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "reviewed":
        return "bg-blue-100 text-blue-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "dismissed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case "spam":
        return "bg-orange-100 text-orange-800"
      case "harassment":
        return "bg-red-100 text-red-800"
      case "inappropriate":
        return "bg-purple-100 text-purple-800"
      case "copyright":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Content Reports</h1>
          <p className="text-gray-600">Review and moderate reported content</p>
        </div>
      </div>

      <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus}>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {reports?.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <AlertTriangle className="w-5 h-5 text-orange-500" />
                          <Badge className={getReasonColor(report.reason)}>{report.reason.toUpperCase()}</Badge>
                          <Badge className={getStatusColor(report.status)}>{report.status.toUpperCase()}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Reporter</h4>
                            <div className="flex items-center space-x-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={report.reporter.avatar_url || "/placeholder.svg"} />
                                <AvatarFallback>{report.reporter.full_name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{report.reporter.full_name}</span>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Reported User</h4>
                            <div className="flex items-center space-x-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={report.reported_user.avatar_url || "/placeholder.svg"} />
                                <AvatarFallback>{report.reported_user.full_name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{report.reported_user.full_name}</span>
                            </div>
                          </div>
                        </div>

                        {report.description && (
                          <div className="mb-4">
                            <h4 className="font-medium text-sm text-gray-700 mb-1">Description</h4>
                            <p className="text-sm text-gray-600">{report.description}</p>
                          </div>
                        )}

                        {(report.reported_post || report.reported_comment) && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Reported Content</h4>
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {report.reported_post?.content || report.reported_comment?.content}
                            </p>
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          Reported {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReport(report)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Report Details</DialogTitle>
                            </DialogHeader>
                            {selectedReport && (
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Reason</h4>
                                  <Badge className={getReasonColor(selectedReport.reason)}>
                                    {selectedReport.reason.toUpperCase()}
                                  </Badge>
                                </div>
                                
                                {selectedReport.description && (
                                  <div>
                                    <h4 className="font-medium mb-2">Description</h4>
                                    <p className="text-sm text-gray-600">{selectedReport.description}</p>
                                  </div>
                                )}

                                {(selectedReport.reported_post || selectedReport.reported_comment) && (
                                  <div>
                                    <h4 className="font-medium mb-2">Reported Content</h4>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm">
                                        {selectedReport.reported_post?.content || selectedReport.reported_comment?.content}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {selectedReport.status === "pending" && (
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        updateReportMutation.mutate({
                                          reportId: selectedReport.id,
                                          status: "resolved",
                                          action: "content_removed",
                                        })
                                      }
                                      disabled={updateReportMutation.isPending}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Resolve
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        updateReportMutation.mutate({
                                          reportId: selectedReport.id,
                                          status: "dismissed",
                                        })
                                      }
                                      disabled={updateReportMutation.isPending}
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Dismiss
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {report.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                updateReportMutation.mutate({
                                  reportId: report.id,
                                  status: "resolved",
                                  action: "content_removed",
                                })
                              }
                              disabled={updateReportMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Resolve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateReportMutation.mutate({
                                  reportId: report.id,
                                  status: "dismissed",
                                })
                              }
                              disabled={updateReportMutation.isPending}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Dismiss
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {reports?.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                    <p className="text-gray-600">No {selectedStatus} reports at this time.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
