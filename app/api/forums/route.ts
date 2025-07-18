import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const groupId = searchParams.get("groupId")

  let query = supabase
    .from("forums")
    .select(`
      *,
      creator:profiles!forums_created_by_fkey (
        full_name,
        avatar_url
      ),
      group:groups (
        name
      )
    `)
    .order("last_post_at", { ascending: false, nullsFirst: false })

  if (category && category !== "all") {
    query = query.eq("category", category)
  }

  if (groupId) {
    query = query.eq("group_id", groupId)
  }

  const { data: forums, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ forums })
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { name, description, category, groupId } = await request.json()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: forum, error } = await supabase
    .from("forums")
    .insert({
      name,
      description,
      category,
      group_id: groupId,
      created_by: session.user.id,
    })
    .select(`
      *,
      creator:profiles!forums_created_by_fkey (
        full_name,
        avatar_url
      )
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ forum })
}
