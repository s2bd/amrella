import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const userId = params.id

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      *,
      followers:follows!follows_following_id_fkey (count),
      following:follows!follows_follower_id_fkey (count)
    `)
    .eq("id", userId)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get user's posts
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get user's groups
  const { data: groups } = await supabase
    .from("group_members")
    .select(`
      groups (
        id,
        name,
        avatar_url,
        member_count
      )
    `)
    .eq("user_id", userId)
    .limit(5)

  return NextResponse.json({
    profile,
    posts: posts || [],
    groups: groups?.map((g) => g.groups) || [],
  })
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const userId = params.id
  const updates = await request.json()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session || session.user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Handle cover image upload
  if (updates.coverImage) {
    const base64Data = updates.coverImage.split(",")[1]
    updates.cover_image = Buffer.from(base64Data, "base64")
    delete updates.coverImage
  }

  // Handle avatar upload
  if (updates.avatarImage) {
    const base64Data = updates.avatarImage.split(",")[1]
    updates.avatar_url = `data:image/jpeg;base64,${base64Data}`
    delete updates.avatarImage
  }
  const { data: profile, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile })
}
