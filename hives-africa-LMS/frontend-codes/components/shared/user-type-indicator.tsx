"use client"

import { Badge } from "@/components/ui/badge"
import { User } from "@/contexts/AuthContext"
import { Shield, GraduationCap, Users } from "lucide-react"

interface UserTypeIndicatorProps {
  user: User
  showMessage?: boolean
}

export function UserTypeIndicator({ user, showMessage = false }: UserTypeIndicatorProps) {
  const getUserTypeConfig = (userType: string) => {
    switch (userType) {
      case 'admin':
        return {
          icon: Shield,
          label: 'Admin',
          variant: 'destructive' as const,
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          iconColor: 'text-red-600'
        }
      case 'instructor':
        return {
          icon: GraduationCap,
          label: 'Instructor',
          variant: 'secondary' as const,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          iconColor: 'text-blue-600'
        }
      case 'student':
      default:
        return {
          icon: Users,
          label: 'Student',
          variant: 'default' as const,
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          iconColor: 'text-green-600'
        }
    }
  }

  const config = getUserTypeConfig(user.user_type)
  const Icon = config.icon

  if (!showMessage) {
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  // Show temporary message for instructor/admin users
  if (user.user_type === 'instructor' || user.user_type === 'admin') {
    return (
      <div className={`${config.bgColor} border border-opacity-20 rounded-lg p-3 mb-4`}>
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`h-4 w-4 ${config.iconColor}`} />
          <span className={`font-medium text-sm ${config.textColor}`}>
            {config.label} Account Detected
          </span>
        </div>
        <p className="text-xs text-gray-600">
          Welcome! Your {config.label.toLowerCase()} dashboard is currently under development. 
          For now, you can access student features and course content. Full {config.label.toLowerCase()} 
          functionality will be available soon.
        </p>
      </div>
    )
  }

  return null
}
