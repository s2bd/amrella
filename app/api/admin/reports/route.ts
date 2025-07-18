import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") || "pending"

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user is admin
  const { data: user } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (!user || !["admin", "super_admin"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { data: reports, error } = await supabase
    .from("reports")
    .select(`
      *,
      reporter:profiles!reports_reporter_id_fkey (
        full_name,
        avatar_url
      ),
      reported_user:profiles!reports_reported_user_id_fkey (
        full_name,
        avatar_url
      ),
      reported_post:posts (
        content,
        created_at
      ),
      reported_comment:comments (
        content,
        created_at
      )
    `)
    .eq("status", status)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ reports })
}

export async function PATCH(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { reportId, status, action } = await request.json()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user is admin
  const { data: user } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (!user || !["admin", "super_admin"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Update report status
  const { error } = await supabase
    .from("reports")
    .update({
      status,
      reviewed_by: session.user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log admin activity
  await supabase.rpc("log_admin_activity", {
    admin_id: session.user.id,
    action: "report_reviewed",
    target_type: "report",
    target_id: reportId,
    details: { status, action },
  })

  return NextResponse.json({ success: true })
}
