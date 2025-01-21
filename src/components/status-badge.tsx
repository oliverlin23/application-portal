import { cn } from "@/lib/utils"
import { ApplicationStatus } from "@prisma/client"

const statusConfig = {
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800 border-blue-200"
  },
  SUBMITTED: {
    label: "Submitted",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200"
  },
  ACCEPTED: {
    label: "Accepted",
    color: "bg-green-100 text-green-800 border-green-200"
  },
  WAITLISTED: {
    label: "Waitlisted",
    color: "bg-purple-100 text-purple-800 border-purple-200"
  },
  DENIED: {
    label: "Denied",
    color: "bg-red-100 text-red-800 border-red-200"
  },
  WITHDRAWN: {
    label: "Withdrawn",
    color: "bg-gray-100 text-gray-800 border-gray-200"
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-green-100 text-green-800 border-green-200"
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = statusConfig[status]
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      config.color
    )}>
      {config.label}
    </span>
  )
}

export function getStatusColor(status: ApplicationStatus) {
  return statusConfig[status].color
}

export function getStatusLabel(status: ApplicationStatus) {
  return statusConfig[status].label
} 