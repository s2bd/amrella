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
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Clock, CheckCircle, AlertCircle, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "@/hooks/use-toast"

interface SupportTicket {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  created_at: string
  user: {
    full_name: string
    avatar_url: string
    email: string
  }
  assigned_admin?: {
    full_name: string
    avatar_url: string
  }
}

interface TicketMessage {
  id: string
  message: string
  created_at: string
  is_internal: boolean
  sender: {
    full_name: string
    avatar_url: string
    role: string
  }
}

export default function AdminSupportPage() {
  const [selectedStatus, setSelectedStatus] = useState("open")
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
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

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["admin-support-tickets", selectedStatus],
    queryFn: async () => {
      const response = await fetch(`/api/support/tickets?status=${selectedStatus}`)
      if (!response.ok) throw new Error("Failed to fetch tickets")
      const data = await response.json()
      return data.tickets as SupportTicket[]
    },
  })

  const { data: messages } = useQuery({
    queryKey: ["ticket-messages", selectedTicket],
    queryFn: async () => {
      if (!selectedTicket) return []
      const response = await fetch(`/api/support/tickets/${selectedTicket}/messages`)
      if (!response.ok) throw new Error("Failed to fetch messages")
      const data = await response.json()
      return data.messages as TicketMessage[]
    },
    enabled: !!selectedTicket,
  })

  const sendMessageMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const response = await fetch(`/api/support/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })
      if (!response.ok) throw new Error("Failed to send message")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-messages", selectedTicket] })
      setNewMessage("")
      toast({ title: "Success", description: "Message sent successfully" })
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" })
    },
  })

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return
    sendMessageMutation.mutate({ ticketId: selectedTicket, message: newMessage })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-gray-600">Manage and respond to user support requests</p>
        </div>
      </div>

      <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="space-y-6">
        <TabsList>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
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
              {tickets?.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{ticket.title}</h3>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status === "open" && <AlertCircle className="w-3 h-3 mr-1" />}
                            {ticket.status === "in_progress" && <Clock className="w-3 h-3 mr-1" />}
                            {ticket.status === "resolved" && <CheckCircle className="w-3 h-3 mr-1" />}
                            {ticket.status === "closed" && <CheckCircle className="w-3 h-3 mr-1" />}
                            {ticket.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority.toUpperCase()}
                          </Badge>
                        </div>

                        <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Avatar className="w-4 h-4">
                              <AvatarImage src={ticket.user.avatar_url || "/placeholder-user.jpg"} />
                              <AvatarFallback>{ticket.user.full_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{ticket.user.full_name}</span>
                          </div>
                          <span>Category: {ticket.category}</span>
                          <span>Created {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                          {ticket.assigned_admin && (
                            <div className="flex items-center space-x-1">
                              <span>Assigned to:</span>
                              <Avatar className="w-4 h-4">
                                <AvatarImage src={ticket.assigned_admin.avatar_url || "/placeholder.svg"} />
                                <AvatarFallback>{ticket.assigned_admin.full_name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span>{ticket.assigned_admin.full_name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTicket(ticket.id)}
                            className="ml-4"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Respond
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{ticket.title}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={ticket.user.avatar_url || "/placeholder-user.jpg"} />
                                  <AvatarFallback>{ticket.user.full_name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{ticket.user.full_name}</span>
                                <span className="text-sm text-gray-500">{ticket.user.email}</span>
                              </div>
                              <p className="text-sm">{ticket.description}</p>
                            </div>

                            <ScrollArea className="h-64">
                              <div className="space-y-3">
                                {messages?.map((message) => (
                                  <div
                                    key={message.id}
                                    className={`flex space-x-3 ${
                                      message.sender.role === "admin" || message.sender.role === "super_admin"
                                        ? "justify-end"
                                        : "justify-start"
                                    }`}
                                  >
                                    <div
                                      className={`max-w-xs p-3 rounded-lg ${
                                        message.sender.role === "admin" || message.sender.role === "super_admin"
                                          ? "bg-blue-600 text-white"
                                          : "bg-gray-100"
                                      }`}
                                    >
                                      <div className="flex items-center space-x-2 mb-1">
                                        <Avatar className="w-4 h-4">
                                          <AvatarImage src={message.sender.avatar_url || "/placeholder-user.jpg"} />
                                          <AvatarFallback>{message.sender.full_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs font-medium">{message.sender.full_name}</span>
                                      </div>
                                      <p className="text-sm">{message.message}</p>
                                      <p className="text-xs opacity-75 mt-1">
                                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>

                            <div className="flex space-x-2">
                              <Textarea
                                placeholder="Type your response..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1"
                                rows={3}
                              />
                              <Button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {tickets?.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                    <p className="text-gray-600">No {selectedStatus.replace("_", " ")} tickets at this time.</p>
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
