import { GuestGuard } from '@/components/auth/AuthGuard'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <GuestGuard>{children}</GuestGuard>
}