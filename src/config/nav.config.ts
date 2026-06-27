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
  // 1. Dashboard
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, module: 'DASHBOARD' },

  // 2. Products → Sub Menu → Categories
  {
    label: 'Products',
    href: '/dashboard/products',
    icon: Package,
    module: 'PRODUCTS',
    children: [
      { label: 'All Products', href: '/dashboard/products',   icon: Package, module: 'PRODUCTS' },
      { label: 'Categories',   href: '/dashboard/categories', icon: Tags,    module: 'CATEGORIES' },
    ],
  },

  // 3. Stock Transfer
  { label: 'Stock Transfer', href: '/dashboard/stock-transfer', icon: ArrowLeftRight, module: 'STOCK_TRANSFER' },

  // 4. Dealers
  { label: 'Dealers', href: '/dashboard/dealers', icon: Users2, module: 'DEALERS' },

  // 5. Invoices
  { label: 'Invoices', href: '/dashboard/invoices', icon: FileText },


  // 7. Expenses
  { label: 'Expenses', href: '/dashboard/expenses', icon: Wallet, module: 'EXPENSES' },

  // 8. Meetings
  { label: 'Meetings', href: '/dashboard/meetings', icon: Calendar, module: 'MEETINGS' },

  // 9. Attendance
  { label: 'Attendance', href: '/dashboard/attendance', icon: CalendarDays, module: 'ATTENDANCE' },

    // 6. Sales
  { label: 'Sales', href: '/dashboard/sales', icon: SatelliteDish, module: 'SALES' },

  // 10. Reports
  { label: 'Reports', href: '/dashboard/reports', icon: BarChart3, module: 'REPORTS' },

  // 11. Settings → Users, Branches, Notifications, Appearance, Invoice Settings, Account, Security
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    module: 'SETTINGS',
    children: [
      { label: 'Users',             href: '/dashboard/users',                icon: Users2,   module: 'USERS' },
      { label: 'Branches',          href: '/dashboard/branches',             icon: GitBranch, module: 'BRANCHES' },
      { label: 'Notifications',     href: '/dashboard/notifications',        icon: Bell,      module: 'NOTIFICATIONS' },
      { label: 'Appearance',        href: '/dashboard/settings/appearance',  icon: Palette },
      { label: 'Invoice Settings',  href: '/dashboard/settings/invoice',     icon: Receipt },
      { label: 'Account',           href: '/dashboard/settings/account',     icon: User },
      { label: 'Security',          href: '/dashboard/settings/security',    icon: Lock },
    ],
  },
]