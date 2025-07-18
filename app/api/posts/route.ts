import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const userId = searchParams.get("userId")

  let query = supabase
    .from("posts")
    .select(`
      *,
      profiles (
        full_name,
        avatar_url,
        is_verified,
        verification_type
      ),
      post_likes (count),
      comments (count)
    `)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (userId) {
    query = query.eq("user_id", userId)
  }

  const { data: posts, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ posts })
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { content, type = "text", mediaData, mediaType, mediaFilename } = await request.json()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let processedMediaData = null
  if (mediaData) {
    const base64Data = mediaData.split(",")[1]
    processedMediaData = Buffer.from(base64Data, "base64")
  }

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      user_id: session.user.id,
      content,
      type,
      media_data: processedMediaData,
      media_type: mediaType,
      media_filename: mediaFilename,
    })
    .select(`
      *,
      profiles (
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

  return NextResponse.json({ post })
}
