"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, MessageCircle, Clock, CheckCircle, AlertCircle } from "lucide-react"
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
  updated_at: string
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

export default function SupportPage() {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [newTicketOpen, setNewTicketOpen] = useState(false)
  const [userRole, setUserRole] = useState<string>("")
  const supabase = createClientComponentClient()
  const queryClient = useQueryClient()

  useEffect(() => {
    const getUserRole = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()
        setUserRole(profile?.role || "user")
      }
    }
    getUserRole()
  }, [supabase])

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: async () => {
      const response = await fetch("/api/support/tickets")
      if (!response.ok) throw new Error("Failed to fetch tickets")
      const data = await response.json()
      return data.tickets as SupportTicket[]
    },
  })

  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: {
      title: string
      description: string
      category: string
      priority: string
    }) => {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketData),
      })
      if (!response.ok) throw new Error("Failed to create ticket")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] })
      setNewTicketOpen(false)
      toast({ title: "Success", description: "Support ticket created successfully" })
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create support ticket", variant: "destructive" })
    },
  })

  const handleCreateTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    createTicketMutation.mutate({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      priority: formData.get("priority") as string,
    })
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4" />
      case "in_progress":
        return <Clock className="w-4 h-4" />
      case "resolved":
        return <CheckCircle className="w-4 h-4" />
      case "closed":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <MessageCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Support Center</h1>
          <p className="text-gray-600">Get help with any questions or issues you may have</p>
        </div>
        <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="Brief description of your issue" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Please provide detailed information about your issue"
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setNewTicketOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTicketMutation.isPending}>
                  {createTicketMutation.isPending ? "Creating..." : "Create Ticket"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="my-tickets" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          {["admin", "super_admin"].includes(userRole) && <TabsTrigger value="all-tickets">All Tickets</TabsTrigger>}
        </TabsList>

        <TabsContent value="my-tickets">
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
              {tickets
                ?.filter((ticket) => !["admin", "super_admin"].includes(userRole) || selectedTicket)
                ?.map((ticket) => (
                  <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg">{ticket.title}</h3>
                            <Badge className={getStatusColor(ticket.status)}>
                              {getStatusIcon(ticket.status)}
                              <span className="ml-1 capitalize">{ticket.status.replace("_", " ")}</span>
                            </Badge>
                            <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority.toUpperCase()}</Badge>
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Category: {ticket.category}</span>
                            <span>Created {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                            {ticket.assigned_admin && (
                              <div className="flex items-center space-x-1">
                                <span>Assigned to:</span>
                                <Avatar className="w-4 h-4">
                                  <AvatarImage src={ticket.assigned_admin.avatar_url || "/placeholder-user.jpg"} />
                                  <AvatarFallback>{ticket.assigned_admin.full_name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{ticket.assigned_admin.full_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTicket(ticket.id)}
                          className="ml-4"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {tickets?.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No support tickets</h3>
                    <p className="text-gray-600 mb-4">You haven't created any support tickets yet.</p>
                    <Button onClick={() => setNewTicketOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Ticket
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="faq">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">How do I create a group?</h4>
                    <p className="text-gray-600 text-sm">
                      Navigate to the Groups page and click "Create Group". Fill in the required information including name, description, and category.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">How do I upload a profile picture?</h4>
                    <p className="text-gray-600 text-sm">
                      Go to your profile page and click "Edit Profile". You can upload both a profile picture and cover image.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">How do I message another user?</h4>
                    <p className="text-gray-600 text-sm">
                      Visit their profile page and click the "Message" button, or go to the Messages section to start a new conversation.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">How do I report inappropriate content?</h4>
                    <p className="text-gray-600 text-sm">
                      Click the three-dot menu on any post and select "Report post". Choose the appropriate reason and provide additional details.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">How do I join a course?</h4>
                    <p className="text-gray-600 text-sm">
                      Browse courses in the Courses section and click "Enroll" on any course you're interested in.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Can I delete my account?</h4>
                    <p className="text-gray-600 text-sm">
                      Yes, you can request account deletion by contacting our support team. Please note that this action is irreversible.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {["admin", "super_admin"].includes(userRole) && (
          <TabsContent value="all-tickets">
            <div className="space-y-4">
              {tickets?.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{ticket.title}</h3>
                          <Badge className={getStatusColor(ticket.status)}>
                            {getStatusIcon(ticket.status)}
                            <span className="ml-1 capitalize">{ticket.status.replace("_", " ")}</span>
                          </Badge>
                          <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority.toUpperCase()}</Badge>
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
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedTicket(ticket.id)} className="ml-4">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Respond
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
