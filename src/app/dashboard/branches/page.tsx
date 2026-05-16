'use client'

import { useEffect, useState } from 'react'
import { branchesService } from '@/services/branches.service'
import type { BranchWithStats } from '@/types/branches.types'
import BranchesHeader from './_components/BranchesHeader'
import BranchesTable from './_components/BranchesTable'
import CreateBranchModal from './_components/CreateBranchModal'
import EditBranchModal from './_components/EditBranchModal'
import BranchStatsModal from './_components/BranchStatsModal'
import DeleteBranchDialog from './_components/DeleteBranchDialog'
import { toast } from 'sonner'

export default function BranchesPage() {
  const [branches, setBranches] = useState<BranchWithStats[]>([])
  const [loading, setLoading] = useState(true)

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<BranchWithStats | null>(null)
  const [statsTarget, setStatsTarget] = useState<BranchWithStats | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BranchWithStats | null>(null)

  const fetchBranches = async () => {
    try {
      setLoading(true)
      const data = await branchesService.getAll()
      setBranches(data)
    } catch {
      toast.error('Failed to load branches.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBranches()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <BranchesHeader onCreateClick={() => setCreateOpen(true)} />

      <BranchesTable
        branches={branches}
        loading={loading}
        onEdit={(branch) => setEditTarget(branch)}
        onDelete={(branch) => setDeleteTarget(branch)}
        onViewStats={(branch) => setStatsTarget(branch)}
      />

      <CreateBranchModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setCreateOpen(false)
          fetchBranches()
        }}
      />

      <EditBranchModal
        branch={editTarget}
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={() => {
          setEditTarget(null)
          fetchBranches()
        }}
      />

      <BranchStatsModal
        branch={statsTarget}
        open={!!statsTarget}
        onClose={() => setStatsTarget(null)}
      />

      <DeleteBranchDialog
        branch={deleteTarget}
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => {
          setDeleteTarget(null)
          fetchBranches()
        }}
      />
    </div>
  )
}