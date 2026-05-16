import type { Pagination } from '@/types/stock-transfer.types'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  pagination: Pagination
  page: number
  onPageChange: (p: number) => void
}

export default function TablePagination({ pagination, page, onPageChange }: Props) {
  if (pagination.pages <= 1) return null

  const start = (page - 1) * pagination.limit + 1
  const end = Math.min(page * pagination.limit, pagination.total)

  const pageNums = Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{start}–{end}</span> of{' '}
        <span className="font-medium text-foreground">{pagination.total}</span>
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {pageNums.map(p => (
          <Button
            key={p}
            variant={page === p ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8 text-sm"
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page === pagination.pages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}