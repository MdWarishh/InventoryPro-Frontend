'use client'
import type { DashboardStats } from '@/types/reports.types'

interface Props {
  stats: DashboardStats | null
  loading?: boolean
}

const fmt = (n: number) =>
  n >= 1_00_000
    ? `₹${(n / 1_00_000).toFixed(1)}L`
    : n >= 1_000
    ? `₹${(n / 1_000).toFixed(1)}K`
    : `₹${n.toFixed(0)}`

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100" />
        <div className="flex-1">
          <div className="h-3 bg-gray-100 rounded w-24 mb-2" />
          <div className="h-6 bg-gray-100 rounded w-20" />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  valueColor = 'text-gray-900',
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  iconBg: string
  valueColor?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className={`text-2xl font-semibold mt-0.5 ${valueColor}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  )
}

export default function DashboardOverview({ stats, loading }: Props) {
  if (loading) {
    return (
      <div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-32 mb-4" />
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex-1 h-3 bg-gray-100 rounded" />
                  <div className="w-10 h-3 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Today's Sales"
          value={fmt(stats.todaySales.amount)}
          sub={`${stats.todaySales.count} transactions`}
          iconBg="bg-blue-50"
          valueColor="text-blue-700"
          icon={
            <svg width="18" height="18" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          }
        />
        <StatCard
          label="Month Sales"
          value={fmt(stats.monthSales.amount)}
          sub={`${stats.monthSales.count} transactions`}
          iconBg="bg-violet-50"
          valueColor="text-violet-700"
          icon={
            <svg width="18" height="18" fill="none" stroke="#7c3aed" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
        <StatCard
          label="Total Stock"
          value={stats.totalStock.toLocaleString('en-IN')}
          sub="units across branches"
          iconBg="bg-amber-50"
          valueColor="text-amber-700"
          icon={
            <svg width="18" height="18" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            </svg>
          }
        />
        <StatCard
          label="Low Stock Alerts"
          value={stats.lowStockCount}
          sub="items need restocking"
          iconBg="bg-red-50"
          valueColor={stats.lowStockCount > 0 ? 'text-red-600' : 'text-gray-900'}
          icon={
            <svg width="18" height="18" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
        />
        <StatCard
          label="Total Products"
          value={stats.totalProducts.toLocaleString('en-IN')}
          sub="active products"
          iconBg="bg-green-50"
          valueColor="text-green-700"
          icon={
            <svg width="18" height="18" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          }
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RecentTable title="Recent Stock In" items={stats.recentStockIns} type="in" />
        <RecentTable title="Recent Stock Out" items={stats.recentStockOuts} type="out" />
      </div>
    </div>
  )
}

function RecentTable({
  title,
  items,
  type,
}: {
  title: string
  items: DashboardStats['recentStockIns']
  type: 'in' | 'out'
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full
            ${type === 'in' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}
        >
          {type === 'in' ? '↓ IN' : '↑ OUT'}
        </span>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No recent activity</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
            <span>Product</span>
            <span>Branch</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Date</span>
          </div>
          {items.map(item => (
            <div key={item.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                <p className="text-xs text-gray-400">{item.product.sku}</p>
              </div>
              <span className="text-xs text-gray-500 self-center">{item.branch.name}</span>
              <span className={`text-sm font-semibold self-center text-right
                ${type === 'in' ? 'text-green-600' : 'text-red-500'}`}>
                {type === 'in' ? '+' : '-'}{item.quantity}
              </span>
              <span className="text-xs text-gray-400 self-center text-right">
                {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}