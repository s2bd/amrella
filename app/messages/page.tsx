"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Search, Phone, Video, MoreHorizontal } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Conversation {
  id: string
  participant: {
    id: string
    full_name: string
    avatar_url: string
    status: "online" | "offline"
  }
  last_message: {
    content: string
    created_at: string
    sender_id: string
  }
  unread_count: number
}

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  conversation_id: string
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ["conversations", searchTerm],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      let query = supabase
        .from("conversations")
        .select(`
          *,
          participant:profiles!conversations_participant_id_fkey (
            id,
            full_name,
            avatar_url,
            status
          ),
          last_message:messages (
            content,
            created_at,
            sender_id
          )
        `)
        .eq("user_id", user?.id)
        .order("updated_at", { ascending: false })

      if (searchTerm) {
        query = query.ilike("participant.full_name", `%${searchTerm}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Conversation[]
    },
  })

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return []

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedConversation)
        .order("created_at", { ascending: true })

      if (error) throw error
      return data as Message[]
    },
    enabled: !!selectedConversation,
  })

  const selectedConversationData = conversations?.find((c) => c.id === selectedConversation)

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from("messages").insert({
      content: newMessage,
      conversation_id: selectedConversation,
      sender_id: user?.id,
    })

    if (!error) {
      setNewMessage("")
      // Refetch messages
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold mb-4">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <ScrollArea className="h-[calc(100%-120px)]">
                <div className="p-2">
                  {conversationsLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    conversations?.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                          selectedConversation === conversation.id ? "bg-blue-50 border-blue-200" : ""
                        }`}
                      >
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={conversation.participant.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>{conversation.participant.full_name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          {conversation.participant.status === "online" && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{conversation.participant.full_name}</p>
                            {conversation.unread_count > 0 && (
                              <Badge className="ml-2">{conversation.unread_count}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{conversation.last_message?.content}</p>
                          <p className="text-xs text-gray-400">
                            {conversation.last_message?.created_at &&
                              formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={selectedConversationData?.participant.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {selectedConversationData?.participant.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedConversationData?.participant.full_name}</p>
                      <p className="text-sm text-gray-500">
                        {selectedConversationData?.participant.status === "online" ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messagesLoading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                            <div
                              className={`max-w-xs p-3 rounded-lg animate-pulse ${
                                i % 2 === 0 ? "bg-gray-200" : "bg-blue-200"
                              }`}
                            >
                              <div className="h-4 bg-gray-300 rounded"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      messages?.map((message) => {
                        const isOwn = message.sender_id === selectedConversationData?.participant.id
                        return (
                          <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwn ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${isOwn ? "text-blue-100" : "text-gray-500"}`}>
                                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
                  <p className="text-gray-500">Choose a conversation to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
