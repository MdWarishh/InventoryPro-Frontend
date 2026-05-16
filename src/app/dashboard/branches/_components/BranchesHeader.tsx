'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  onCreateClick: () => void
}

export default function BranchesHeader({ onCreateClick }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Branches</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage all your hotel branches and their details.
        </p>
      </div>
      <Button onClick={onCreateClick} className="gap-2">
        <Plus className="w-4 h-4" />
        Add Branch
      </Button>
    </div>
  )
}