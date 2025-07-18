import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const category = searchParams.get("category")

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user is admin to see all tickets
  const { data: user } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  let query = supabase
    .from("support_tickets")
    .select(`
      *,
      user:profiles!support_tickets_user_id_fkey (
        full_name,
        avatar_url,
        email
      ),
      assigned_admin:profiles!support_tickets_assigned_to_fkey (
        full_name,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false })

  // If not admin, only show user's own tickets
  if (!user || !["admin", "super_admin"].includes(user.role)) {
    query = query.eq("user_id", session.user.id)
  }

  if (status) {
    query = query.eq("status", status)
  }

  if (category) {
    query = query.eq("category", category)
  }

  const { data: tickets, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tickets })
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { title, description, category, priority } = await request.json()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: ticket, error } = await supabase
    .from("support_tickets")
    .insert({
      user_id: session.user.id,
      title,
      description,
      category,
      priority: priority || "medium",
    })
    .select(`
      *,
      user:profiles!support_tickets_user_id_fkey (
        full_name,
        avatar_url,
        email
      )
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ticket })
}
