import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(`
      *,
      participant:profiles!conversations_participant_id_fkey (
        id,
        full_name,
        avatar_url,
        status
      ),
      messages (
        content,
        created_at,
        sender_id
      )
    `)
    .eq("user_id", session.user.id)
    .order("updated_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get the latest message for each conversation
  const conversationsWithLatestMessage = conversations.map(conv => ({
    ...conv,
    last_message: conv.messages?.[0] || null
  }))

  return NextResponse.json({ conversations: conversationsWithLatestMessage })
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { participantId } = await request.json()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if conversation already exists
  const { data: existingConversation } = await supabase
    .from("conversations")
    .select("id")
    .or(`and(user_id.eq.${session.user.id},participant_id.eq.${participantId}),and(user_id.eq.${participantId},participant_id.eq.${session.user.id})`)
    .single()

  if (existingConversation) {
    return NextResponse.json({ conversationId: existingConversation.id })
  }

  // Create new conversation
  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      user_id: session.user.id,
      participant_id: participantId,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Create reverse conversation for the participant
  await supabase.from("conversations").insert({
    user_id: participantId,
    participant_id: session.user.id,
  })

  return NextResponse.json({ conversationId: conversation.id })
}
