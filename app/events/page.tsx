"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Users, Clock, Plus, Video } from "lucide-react"
import { format } from "date-fns"

interface Event {
  id: string
  title: string
  description: string
  cover_url: string
  start_date: string
  end_date: string
  location: string
  is_virtual: boolean
  meeting_url: string
  max_attendees: number
  attendee_count: number
  category: string
  privacy: "public" | "private"
  organizer: {
    full_name: string
    avatar_url: string
  }
}

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const supabase = createClientComponentClient()

  const { data: events, isLoading } = useQuery({
    queryKey: ["events", selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select(`
          *,
          organizer:profiles!events_organizer_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Event[]
    },
  })

  const { data: myEvents } = useQuery({
    queryKey: ["my-events"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from("event_attendees")
        .select(`
          events (
            *,
            organizer:profiles!events_organizer_id_fkey (
              full_name,
              avatar_url
            )
          )
        `)
        .eq("user_id", user?.id)
        .eq("status", "going")

      if (error) throw error
      return data.map((item) => item.events) as Event[]
    },
  })

  const categories = ["all", "Technology", "Business", "Health", "Arts", "Sports", "Education"]

  const handleJoinEvent = async (eventId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from("event_attendees").upsert({
      event_id: eventId,
      user_id: user?.id,
      status: "going",
    })

    if (!error) {
      // Refetch events
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Events</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      <Tabs defaultValue="discover" className="space-y-6">
        <TabsList>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="my-events">My Events</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category === "all" ? "All Categories" : category}
              </Button>
            ))}
          </div>

          {/* Events Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events?.map((event) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                    {event.cover_url && (
                      <img
                        src={event.cover_url || "/placeholder-user.jpg"}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary">{event.category}</Badge>
                    </div>
                    {event.is_virtual && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-green-600">
                          <Video className="w-3 h-3 mr-1" />
                          Virtual
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                      </div>

                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{format(new Date(event.start_date), "MMM dd, yyyy")}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{format(new Date(event.start_date), "h:mm a")}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          <span>{event.attendee_count} attending</span>
                          {event.max_attendees && <span className="text-gray-400"> / {event.max_attendees}</span>}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={event.organizer.avatar_url || "/placeholder-user.jpg"} />
                            <AvatarFallback>{event.organizer.full_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">{event.organizer.full_name}</span>
                        </div>
                        <Button size="sm" onClick={() => handleJoinEvent(event.id)}>
                          Join Event
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-events">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myEvents?.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                  {event.cover_url && (
                    <img
                      src={event.cover_url || "/placeholder-user.jpg"}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary">{event.category}</Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                    </div>

                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{format(new Date(event.start_date), "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{format(new Date(event.start_date), "h:mm a")}</span>
                      </div>
                    </div>

                    <Button className="w-full bg-transparent" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}