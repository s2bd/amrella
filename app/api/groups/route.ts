import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const search = searchParams.get("search")
  const userId = searchParams.get("userId") // For user's groups

  let query = supabase
    .from("groups")
    .select(`
      *,
      owner:profiles!groups_owner_id_fkey (
        full_name,
        avatar_url,
        is_verified,
        verification_type
      )
    `)
    .order("member_count", { ascending: false })

  if (category && category !== "all") {
    query = query.eq("category", category)
  }

  if (search) {
    query = query.ilike("name", `%${search}%`)
  }

  if (userId) {
    // Get user's groups
    const { data: memberGroups } = await supabase.from("group_members").select("group_id").eq("user_id", userId)

    if (memberGroups) {
      const groupIds = memberGroups.map((m) => m.group_id)
      query = query.in("id", groupIds)
    }
  }

  const { data: groups, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ groups })
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { name, description, category, privacy, coverImage } = await request.json()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let coverImageData = null
  if (coverImage) {
    // Convert base64 to buffer for blob storage
    const base64Data = coverImage.split(",")[1]
    coverImageData = Buffer.from(base64Data, "base64")
  }

  const { data: group, error } = await supabase
    .from("groups")
    .insert({
      name,
      description,
      category,
      privacy,
      owner_id: session.user.id,
      cover_image: coverImageData,
    })
    .select(`
      *,
      owner:profiles!groups_owner_id_fkey (
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

  // Add owner as first member
  await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: session.user.id,
    role: "owner",
  })

  return NextResponse.json({ group })
}
