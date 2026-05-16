'use client'
import { useState, useEffect } from 'react'
import { reportsService } from '@/services/reports.service'
import type { ReportTab, DashboardStats } from '@/types/reports.types'
import DashboardOverview from './_components/DashboardOverview'
import SalesReport from './_components/SalesReport'
import PurchaseReport from './_components/PurchaseReport'
import InventoryReport from './_components/InventoryReport'
import BranchesReport from './_components/BranchesReport'
import GSTReport from './_components/GSTReport'

// Replace with your actual auth hook
const useUser = () => ({
  role: 'SUPER_ADMIN' as const,
  branchId: undefined as string | undefined,
})

// Replace with actual branches API call
const useBranches = () => {
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([])
  useEffect(() => {
    // fetch('/api/branches').then(r => r.json()).then(d => setBranches(d.data))
    setBranches([
      { id: 'b1', name: 'Main Branch' },
      { id: 'b2', name: 'Downtown' },
      { id: 'b3', name: 'North Wing' },
    ])
  }, [])
  return branches
}

const TABS: { id: ReportTab; label: string; icon: React.ReactNode; superAdminOnly?: boolean }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  },
  {
    id: 'purchase',
    label: 'Purchase',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      </svg>
    ),
  },
  {
    id: 'gst',
    label: 'GST',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    id: 'branches',
    label: 'All Branches',
    superAdminOnly: true,
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
]

export default function ReportsPage() {
  const user = useUser()
  const branches = useBranches()
  const isSuperAdmin = user.role === 'SUPER_ADMIN'
  const [activeTab, setActiveTab] = useState<ReportTab>('dashboard')
  const [dashStats, setDashStats] = useState<DashboardStats | null>(null)
  const [dashLoading, setDashLoading] = useState(true)

  useEffect(() => {
    if (activeTab === 'dashboard') {
      setDashLoading(true)
      reportsService.getDashboard().then(setDashStats).finally(() => setDashLoading(false))
    }
  }, [activeTab])

  const visibleTabs = TABS.filter(t => !t.superAdminOnly || isSuperAdmin)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isSuperAdmin ? 'Super Admin — All Branches' : 'Branch Analytics'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs text-gray-500 font-medium">Live Data</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="max-w-screen-xl mx-auto flex gap-1 overflow-x-auto">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all
                ${activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className={activeTab === tab.id ? 'text-gray-900' : 'text-gray-400'}>
                {tab.icon}
              </span>
              {tab.label}
              {tab.superAdminOnly && (
                <span className="ml-1 w-1.5 h-1.5 rounded-full bg-violet-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-screen-xl mx-auto px-6 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview stats={dashStats} loading={dashLoading} />
        )}
        {activeTab === 'sales' && (
          <SalesReport isSuperAdmin={isSuperAdmin} branches={branches} />
        )}
        {activeTab === 'purchase' && (
          <PurchaseReport isSuperAdmin={isSuperAdmin} branches={branches} />
        )}
        {activeTab === 'inventory' && (
          <InventoryReport isSuperAdmin={isSuperAdmin} branches={branches} />
        )}
        {activeTab === 'gst' && (
          <GSTReport isSuperAdmin={isSuperAdmin} branches={branches} />
        )}
        {activeTab === 'branches' && isSuperAdmin && (
          <BranchesReport />
        )}
      </div>
    </div>
  )
}