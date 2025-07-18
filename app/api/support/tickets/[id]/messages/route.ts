import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const ticketId = params.id

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: messages, error } = await supabase
    .from("support_ticket_messages")
    .select(`
      *,
      sender:profiles!support_ticket_messages_sender_id_fkey (
        full_name,
        avatar_url,
        role
      )
    `)
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ messages })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const ticketId = params.id
  const { message, isInternal } = await request.json()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: newMessage, error } = await supabase
    .from("support_ticket_messages")
    .insert({
      ticket_id: ticketId,
      sender_id: session.user.id,
      message,
      is_internal: isInternal || false,
    })
    .select(`
      *,
      sender:profiles!support_ticket_messages_sender_id_fkey (
        full_name,
        avatar_url,
        role
      )
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: newMessage })
}
