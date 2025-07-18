import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const courseId = params.id

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if already enrolled
  const { data: existingEnrollment } = await supabase
    .from("course_enrollments")
    .select("id")
    .eq("course_id", courseId)
    .eq("user_id", session.user.id)
    .single()

  if (existingEnrollment) {
    return NextResponse.json({ error: "Already enrolled" }, { status: 400 })
  }

  const { error } = await supabase.from("course_enrollments").insert({
    course_id: courseId,
    user_id: session.user.id,
    progress: 0,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
