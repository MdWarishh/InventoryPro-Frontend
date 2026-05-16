import { AuthGuard } from '@/components/auth/AuthGuard'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { SettingsProvider } from '@/components/shared/SettingsProvider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SettingsProvider>
        <DashboardShell>
          {children}
        </DashboardShell>
      </SettingsProvider>
    </AuthGuard>
  )
}