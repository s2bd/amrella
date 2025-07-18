import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const upcoming = searchParams.get("upcoming") === "true"
  const userId = searchParams.get("userId")

  let query = supabase
    .from("events")
    .select(`
      *,
      organizer:profiles!events_organizer_id_fkey (
        full_name,
        avatar_url,
        is_verified,
        verification_type
      ),
      event_attendees (count)
    `)
    .order("start_date", { ascending: true })

  if (category && category !== "all") {
    query = query.eq("category", category)
  }

  if (upcoming) {
    query = query.gte("start_date", new Date().toISOString())
  }

  if (userId) {
    // Get user's events (attending)
    const { data: attendeeEvents } = await supabase
      .from("event_attendees")
      .select("event_id")
      .eq("user_id", userId)
      .eq("status", "going")

    if (attendeeEvents) {
      const eventIds = attendeeEvents.map(e => e.event_id)
      query = query.in("id", eventIds)
    }
  }

  const { data: events, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ events })
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    title,
    description,
    startDate,
    endDate,
    location,
    isVirtual,
    meetingUrl,
    maxAttendees,
    category,
    privacy = "public",
    coverImage,
  } = await request.json()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let coverImageData = null
  if (coverImage) {
    const base64Data = coverImage.split(",")[1]
    coverImageData = Buffer.from(base64Data, "base64")
  }

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      location,
      is_virtual: isVirtual,
      meeting_url: meetingUrl,
      max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
      category,
      privacy,
      organizer_id: session.user.id,
      cover_image: coverImageData,
    })
    .select(`
      *,
      organizer:profiles!events_organizer_id_fkey (
        full_name,
        avatar_url,
        is_verified,
        verification_type
      )
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ event })
}