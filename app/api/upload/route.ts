import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer for blob storage
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Return the blob data and metadata
    return NextResponse.json({
      success: true,
      data: {
        filename: file.name,
        type: file.type,
        size: file.size,
        blob: buffer.toString("base64"), // Convert to base64 for JSON transport
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
