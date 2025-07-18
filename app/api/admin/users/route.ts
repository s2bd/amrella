import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "20")
  const search = searchParams.get("search") || ""
  const role = searchParams.get("role") || ""

  // Check if user is admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: adminUser } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (!adminUser || !["admin", "super_admin"].includes(adminUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Build query
  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .range((page - 1) * limit, page * limit - 1)
    .order("created_at", { ascending: false })

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  if (role) {
    query = query.eq("role", role)
  }

  const { data: users, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    users,
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil((count || 0) / limit),
    },
  })
}

export async function PATCH(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { userId, updates } = await request.json()

  // Check if user is admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: adminUser } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (!adminUser || !["admin", "super_admin"].includes(adminUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Update user
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log admin activity
  await supabase.rpc("log_admin_activity", {
    admin_id: session.user.id,
    action: "user_updated",
    target_type: "user",
    target_id: userId,
    details: updates,
  })

  return NextResponse.json({ user: data })
}
