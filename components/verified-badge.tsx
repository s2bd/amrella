import { CheckCircle } from "lucide-react"

interface VerifiedBadgeProps {
  isVerified: boolean
  verificationType?: "individual" | "business" | "creator" | "organization"
  size?: "sm" | "md" | "lg"
}

export function VerifiedBadge({ isVerified, verificationType = "individual", size = "sm" }: VerifiedBadgeProps) {
  if (!isVerified) return null

  const getVerificationColor = () => {
    switch (verificationType) {
      case "business":
        return "text-blue-600"
      case "creator":
        return "text-purple-600"
      case "organization":
        return "text-green-600"
      default:
        return "text-blue-600"
    }
  }

  const getSize = () => {
    switch (size) {
      case "lg":
        return "w-6 h-6"
      case "md":
        return "w-5 h-5"
      default:
        return "w-4 h-4"
    }
  }

  return <CheckCircle className={`${getSize()} ${getVerificationColor()} fill-current`} />
}
