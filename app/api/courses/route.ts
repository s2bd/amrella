import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const level = searchParams.get("level")
  const userId = searchParams.get("userId") // For user's enrolled courses

  let query = supabase
    .from("courses")
    .select(`
      *,
      instructor:profiles!courses_instructor_id_fkey (
        full_name,
        avatar_url,
        is_verified,
        verification_type
      )
    `)
    .eq("is_published", true)
    .order("enrollment_count", { ascending: false })

  if (category && category !== "all") {
    query = query.eq("category", category)
  }

  if (level && level !== "all") {
    query = query.eq("level", level)
  }

  if (userId) {
    // Get user's enrolled courses
    const { data: enrollments } = await supabase
      .from("course_enrollments")
      .select("course_id, progress")
      .eq("user_id", userId)

    if (enrollments) {
      const courseIds = enrollments.map((e) => e.course_id)
      query = query.in("id", courseIds)
    }
  }

  const { data: courses, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ courses })
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { title, description, category, level, price, thumbnail } = await request.json()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let thumbnailData = null
  if (thumbnail) {
    const base64Data = thumbnail.split(",")[1]
    thumbnailData = Buffer.from(base64Data, "base64")
  }

  const { data: course, error } = await supabase
    .from("courses")
    .insert({
      title,
      description,
      category,
      level,
      price: Number.parseFloat(price) || 0,
      instructor_id: session.user.id,
      thumbnail_data: thumbnailData,
    })
    .select(`
      *,
      instructor:profiles!courses_instructor_id_fkey (
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

  return NextResponse.json({ course })
}
