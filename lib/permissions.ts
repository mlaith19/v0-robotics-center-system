export type UserRole = "תלמיד" | "מורה" | "מזכירה" | "חשבונאות" | "אחר" | "סופר אדמין"

export type User = {
  id: string
  username: string
  role: UserRole
  permissions: string[]
}

/**
 * Check if current user has a specific permission
 */
export function hasPermission(permission: string): boolean {
  if (typeof window === "undefined") return false

  const userStr = localStorage.getItem("robotics-current-user")
  if (!userStr) return false

  const user = JSON.parse(userStr) as User

  // Super admin has all permissions
  if (user.role === "סופר אדמין") return true

  return user.permissions?.includes(permission) ?? false
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  const userStr = localStorage.getItem("robotics-current-user")
  if (!userStr) return null

  return JSON.parse(userStr) as User
}

/**
 * Check multiple permissions (returns true if user has ANY of them)
 */
export function hasAnyPermission(...permissions: string[]): boolean {
  return permissions.some((permission) => hasPermission(permission))
}

/**
 * Check multiple permissions (returns true if user has ALL of them)
 */
export function hasAllPermissions(...permissions: string[]): boolean {
  return permissions.every((permission) => hasPermission(permission))
}
