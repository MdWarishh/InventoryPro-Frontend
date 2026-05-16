'use client'

import { useRouter } from 'next/navigation'
import {
  Building2, Phone, Mail, MapPin, Hash,
  Package, TrendingUp, FileText, MoreVertical,
  Pencil, Trash2, Eye, ArrowRight,
} from 'lucide-react'
import type { Dealer } from '@/types/dealers.types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Props {
  dealer: Dealer
  onEdit: (dealer: Dealer) => void
  onDelete: (dealer: Dealer) => void
}

export default function DealerCard({ dealer, onEdit, onDelete }: Props) {
  const router = useRouter()

  const initials = dealer.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <Card
      className="group relative cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40 overflow-hidden"
      onClick={() => router.push(`/dashboard/dealers/${dealer.id}`)}
    >
      {/* Accent top line on hover */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-primary via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <CardContent className="p-5 space-y-4">

        {/* ── Top Row ── */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0 border border-primary/20">
              {initials}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-foreground leading-tight truncate">{dealer.name}</h3>
              {(dealer.city || dealer.state) && (
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                  {[dealer.city, dealer.state].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Dropdown — stop card click propagation */}
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  className="gap-2 text-sm cursor-pointer"
                  onClick={() => router.push(`/dashboard/dealers/${dealer.id}`)}
                >
                  <Eye className="w-3.5 h-3.5" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 text-sm cursor-pointer"
                  onClick={() => onEdit(dealer)}
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-sm cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => onDelete(dealer)}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Deactivate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ── Contact Info ── */}
        <div className="space-y-1.5">
          {dealer.phone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="w-3 h-3 shrink-0" />
              <span>{dealer.phone}</span>
            </div>
          )}
          {dealer.email && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="w-3 h-3 shrink-0" />
              <span className="truncate">{dealer.email}</span>
            </div>
          )}
          {dealer.gstNumber && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Hash className="w-3 h-3 shrink-0" />
              <span className="font-mono">{dealer.gstNumber}</span>
            </div>
          )}
        </div>

        {/* ── Stats Chips ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900">
            <Package className="w-3 h-3 text-blue-500" />
            <span className="font-semibold tabular-nums text-blue-700 dark:text-blue-400">{dealer._count?.stockIns ?? 0}</span>
            <span className="text-blue-500/70">Stock In</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">{dealer._count?.stockOuts ?? 0}</span>
            <span className="text-emerald-500/70">Sales</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs bg-violet-50 border-violet-100 dark:bg-violet-950/20 dark:border-violet-900">
            <FileText className="w-3 h-3 text-violet-500" />
            <span className="font-semibold tabular-nums text-violet-700 dark:text-violet-400">{dealer._count?.invoices ?? 0}</span>
            <span className="text-violet-500/70">Invoices</span>
          </div>
        </div>

        {/* ── Hover CTA ── */}
        <div className="flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <Building2 className="w-3 h-3" />
          View dealer
          <ArrowRight className="w-3 h-3" />
        </div>

      </CardContent>
    </Card>
  )
}