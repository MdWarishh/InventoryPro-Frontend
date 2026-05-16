'use client'

import type { BranchWithStats } from '@/types/branches.types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart2, Pencil, Trash2, Crown } from 'lucide-react'

interface Props {
  branches: BranchWithStats[]
  loading: boolean
  onEdit: (branch: BranchWithStats) => void
  onDelete: (branch: BranchWithStats) => void
  onViewStats: (branch: BranchWithStats) => void
}

export default function BranchesTable({
  branches,
  loading,
  onEdit,
  onDelete,
  onViewStats,
}: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-md" />
        ))}
      </div>
    )
  }

  if (!branches.length) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">
        No branches found. Create one to get started.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Branch</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Users</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches.map((branch) => (
            <TableRow key={branch.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {branch.isMainBranch && (
                    <Crown className="w-4 h-4 text-yellow-500 shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{branch.name}</p>
                    {branch.address && (
                      <p className="text-xs text-muted-foreground">{branch.address}</p>
                    )}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                {branch.code ? (
                  <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                    {branch.code}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </TableCell>

              <TableCell>
                <div className="text-sm space-y-0.5">
                  {branch.phone && <p>{branch.phone}</p>}
                  {branch.email && (
                    <p className="text-muted-foreground text-xs">{branch.email}</p>
                  )}
                  {!branch.phone && !branch.email && (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <span className="text-sm">{branch._count?.users ?? '—'}</span>
              </TableCell>

              <TableCell>
                <Badge variant={branch.isActive ? 'default' : 'secondary'}>
                  {branch.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onViewStats(branch)}
                    title="View Stats"
                  >
                    <BarChart2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(branch)}
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  {!branch.isMainBranch && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDelete(branch)}
                      title="Deactivate"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}