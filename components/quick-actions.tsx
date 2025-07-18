import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, BookOpen, MessageCircle, Video, FileText } from "lucide-react"

export function QuickActions() {
  const actions = [
    { icon: Users, label: "Create Group", href: "/groups/create" },
    { icon: Calendar, label: "Schedule Event", href: "/events/create" },
    { icon: BookOpen, label: "Start Course", href: "/courses/create" },
    { icon: Video, label: "Go Live", href: "/live/create" },
    { icon: MessageCircle, label: "Start Discussion", href: "/forums/create" },
    { icon: FileText, label: "Write Article", href: "/articles/create" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Button key={action.label} variant="ghost" className="w-full justify-start" asChild>
            <a href={action.href}>
              <action.icon className="w-4 h-4 mr-3" />
              {action.label}
            </a>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
