import { useAuthStore } from '@/store/auth.store'
import type { UserRole } from '@/types/auth.types'
import type { ModuleKey } from '@/config/nav.config'

export const useAuth = () => {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)
  const error = useAuthStore((s) => s.error)
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const clearError = useAuthStore((s) => s.clearError)

  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const isBranchAdmin = user?.role === 'BRANCH_ADMIN'
  const isStaff = user?.role === 'STAFF'

  const hasRole = (...roles: UserRole[]) => {
    if (!user) return false
    return roles.includes(user.role)
  }

  // SUPER_ADMIN → hamesha true | Baaki → permissions array check
  const hasPermission = (
    module: ModuleKey,
    action: 'canView' | 'canCreate' | 'canEdit' | 'canDelete' = 'canView'
  ): boolean => {
    if (!user) return false
    if (user.role === 'SUPER_ADMIN') return true
    const perm = user.permissions?.find((p) => p.module === module)
    return perm?.[action] ?? false
  }

  const canManageBranches  = isSuperAdmin
  const canViewAllBranches = isSuperAdmin
  const canManageUsers     = isSuperAdmin || isBranchAdmin
  const canBulkUpload      = isSuperAdmin || isBranchAdmin
  const canViewReports     = isSuperAdmin || isBranchAdmin
  const canTransferStock   = isSuperAdmin
  const canAccessSettings  = isSuperAdmin || isBranchAdmin

  return {
    user, isAuthenticated, isLoading, error,
    login, logout, fetchMe, clearError,
    isSuperAdmin, isBranchAdmin, isStaff, hasRole,
    hasPermission,
    canManageBranches, canViewAllBranches, canManageUsers,
    canBulkUpload, canViewReports, canTransferStock, canAccessSettings,
  }
}