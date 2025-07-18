import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const forumId = params.id

  const { data: topics, error } = await supabase
    .from("forum_topics")
    .select(`
      *,
      author:profiles!forum_topics_author_id_fkey (
        full_name,
        avatar_url,
        is_verified,
        verification_type
      )
    `)
    .eq("forum_id", forumId)
    .order("is_pinned", { ascending: false })
    .order("last_reply_at", { ascending: false, nullsFirst: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ topics })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const forumId = params.id
  const { title, content } = await request.json()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: topic, error } = await supabase
    .from("forum_topics")
    .insert({
      forum_id: forumId,
      title,
      content,
      author_id: session.user.id,
    })
    .select(`
      *,
      author:profiles!forum_topics_author_id_fkey (
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

  return NextResponse.json({ topic })
}
