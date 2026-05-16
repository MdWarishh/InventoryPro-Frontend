import {
  LayoutDashboard, Package, Tags,
  FileText, Users2, GitBranch, BarChart3,
  Calendar, Bell, Settings, ArrowLeftRight,
  Palette, Receipt, User, Lock,
  SatelliteDish, CalendarDays, Wallet,
} from 'lucide-react'

export type Role = 'SUPER_ADMIN' | 'BRANCH_ADMIN' | 'STAFF'

export type ModuleKey =
  | 'DASHBOARD' | 'USERS' | 'STOCK' | 'MEETINGS' | 'REPORTS'
  | 'BRANCHES' | 'NOTIFICATIONS' | 'PRODUCTS' | 'CATEGORIES'
  | 'DEALERS' | 'SETTINGS' | 'SALES' | 'STOCK_TRANSFER'
  | 'ATTENDANCE' | 'INVOICES' | 'EXPENSES'

export interface NavChild {
  label: string
  href: string
  icon: React.ElementType
  roles?: Role[]
  module?: ModuleKey
}

export interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles?: Role[]
  badge?: string
  module?: ModuleKey
  children?: NavChild[]
}

export const navItems: NavItem[] = [
  { label: 'Dashboard',      href: '/dashboard',                icon: LayoutDashboard, module: 'DASHBOARD' },

  { label: 'Products',       href: '/dashboard/products',       icon: Package,         module: 'PRODUCTS' },
  { label: 'Categories',     href: '/dashboard/categories',     icon: Tags,            module: 'CATEGORIES' },

  { label: 'Invoices',       href: '/dashboard/invoices',       icon: FileText },
  { label: 'Dealers',        href: '/dashboard/dealers',        icon: Users2,          module: 'DEALERS' },
  { label: 'Sales',          href: '/dashboard/sales',          icon: SatelliteDish,   module: 'SALES' },
  { label: 'Stock Transfer', href: '/dashboard/stock-transfer', icon: ArrowLeftRight,  module: 'STOCK_TRANSFER' },

  { label: 'Expenses',       href: '/dashboard/expenses',       icon: Wallet,          module: 'EXPENSES' },

  { label: 'Branches',       href: '/dashboard/branches',       icon: GitBranch,       module: 'BRANCHES' },
  { label: 'Users',          href: '/dashboard/users',          icon: Users2,          module: 'USERS' },
  { label: 'Reports',        href: '/dashboard/reports',        icon: BarChart3,       module: 'REPORTS' },

  { label: 'Meetings',       href: '/dashboard/meetings',       icon: Calendar,        module: 'MEETINGS' },
  { label: 'Notifications',  href: '/dashboard/notifications',  icon: Bell,            module: 'NOTIFICATIONS', badge: 'notifications' },
  { label: 'Attendance',     href: '/dashboard/attendance',     icon: CalendarDays,    module: 'ATTENDANCE' },

  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    module: 'SETTINGS',
    children: [
      { label: 'Appearance',       href: '/dashboard/settings/appearance', icon: Palette },
      { label: 'Invoice Settings', href: '/dashboard/settings/invoice',    icon: Receipt },
      { label: 'Account',          href: '/dashboard/settings/account',    icon: User },
      { label: 'Security',         href: '/dashboard/settings/security',   icon: Lock },
    ],
  },
]