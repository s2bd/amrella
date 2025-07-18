import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const type = searchParams.get("type") || "all"

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  const results: any = {
    users: [],
    groups: [],
    posts: [],
    courses: [],
    events: [],
  }

  try {
    if (type === "all" || type === "users") {
      const { data: users } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, bio, is_verified, verification_type")
        .or(`full_name.ilike.%${query}%,bio.ilike.%${query}%`)
        .limit(10)
      results.users = users || []
    }

    if (type === "all" || type === "groups") {
      const { data: groups } = await supabase
        .from("groups")
        .select("id, name, description, avatar_url, category, member_count")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq("privacy", "public")
        .limit(10)
      results.groups = groups || []
    }

    if (type === "all" || type === "posts") {
      const { data: posts } = await supabase
        .from("posts")
        .select(`
          id, content, created_at, type,
          profiles (full_name, avatar_url, is_verified, verification_type)
        `)
        .ilike("content", `%${query}%`)
        .limit(10)
      results.posts = posts || []
    }

    if (type === "all" || type === "courses") {
      const { data: courses } = await supabase
        .from("courses")
        .select(`
          id, title, description, category, level, price,
          profiles (full_name, avatar_url)
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq("is_published", true)
        .limit(10)
      results.courses = courses || []
    }

    if (type === "all" || type === "events") {
      const { data: events } = await supabase
        .from("events")
        .select(`
          id, title, description, start_date, location, category,
          profiles (full_name, avatar_url)
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .gte("start_date", new Date().toISOString())
        .limit(10)
      results.events = events || []
    }

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
