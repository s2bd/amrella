import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ActivityFeed } from "@/components/activity-feed"
import { QuickActions } from "@/components/quick-actions"
import { TrendingGroups } from "@/components/trending-groups"
import { OnlineUsers } from "@/components/online-users"

export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <QuickActions />
          <TrendingGroups />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <OnlineUsers />
        </div>
      </div>
    </div>
  )
}
