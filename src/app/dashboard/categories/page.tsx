'use client'

import { useState, useEffect } from 'react'
import {
  Plus, Search, Tag, Pencil, Trash2, X,
  Loader2, CheckCircle2, AlertCircle, AlertTriangle, Package,
} from 'lucide-react'
import { categoriesService } from '@/services/categories.service'
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from '@/types/categories.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/hooks/useAuth'
import { useBranchFilter } from '@/hooks/useBranchFilter'

// ── Preset Colors ─────────────────────────────────────────────────────────────
const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#a855f7', '#84cc16',
]

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return r
    ? `${parseInt(r[1], 16)}, ${parseInt(r[2], 16)}, ${parseInt(r[3], 16)}`
    : '99, 102, 241'
}

// ── Category Form Modal ───────────────────────────────────────────────────────
interface CategoryModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: CreateCategoryPayload | UpdateCategoryPayload) => Promise<void>
  initial?: Category | null
  loading: boolean
}

function CategoryModal({ open, onClose, onSave, initial, loading }: CategoryModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#6366f1')

  useEffect(() => {
    if (initial) {
      setName(initial.name)
      setDescription(initial.description ?? '')
      setColor(initial.color)
    } else {
      setName('')
      setDescription('')
      setColor('#6366f1')
    }
  }, [initial, open])

  const rgb = hexToRgb(color)

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">

        {/* Colored accent line */}
        <div className="h-1 w-full" style={{ background: color }} />

        <DialogHeader className="px-6 pt-5 pb-0">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `rgba(${rgb}, 0.12)`, border: `1.5px solid rgba(${rgb}, 0.25)` }}
            >
              <Tag className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {initial ? 'Edit Category' : 'New Category'}
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {initial ? `Editing "${initial.name}"` : 'Add a new product category'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={async (e) => { e.preventDefault(); await onSave({ name, description, color }) }}
          className="px-6 pt-5 pb-6 flex flex-col gap-5"
        >
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Beverages"
              required
              autoFocus
              className="h-10 text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              Description
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 normal-case tracking-normal font-normal">
                optional
              </Badge>
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description…"
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-2.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Color
            </Label>
            <div className="flex gap-2 flex-wrap items-center">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full transition-all shrink-0 focus:outline-none"
                  style={{
                    background: c,
                    transform: color === c ? 'scale(1.3)' : 'scale(1)',
                    boxShadow: color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none',
                  }}
                />
              ))}
              {/* Custom color */}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-6 h-6 rounded-full cursor-pointer shrink-0 border-2 border-border"
                style={{ padding: 0, overflow: 'hidden' }}
                title="Custom color"
              />
            </div>

            {/* Preview badge */}
            <div className="flex items-center gap-3 pt-1">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  background: `rgba(${rgb}, 0.1)`,
                  border: `1.5px solid rgba(${rgb}, 0.25)`,
                  color,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                {name || 'Preview'}
              </div>
              <span className="text-xs font-mono text-muted-foreground">{color.toUpperCase()}</span>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-2.5 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="h-9 text-sm">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="h-9 text-sm min-w-24 gap-2"
              style={{ background: color, boxShadow: `0 4px 14px rgba(${rgb}, 0.35)` }}
            >
              {loading
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                : initial ? 'Save Changes' : 'Create'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Delete Dialog ─────────────────────────────────────────────────────────────
interface DeleteDialogProps {
  open: boolean
  category: Category | null
  onClose: () => void
  onConfirm: () => Promise<void>
  loading: boolean
}

function DeleteDialog({ open, category, onClose, onConfirm, loading }: DeleteDialogProps) {
  if (!category) return null
  const hasProducts = (category._count?.products ?? 0) > 0

  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <AlertDialogContent className="sm:max-w-sm">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-base">Delete Category?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm">
            <span className="font-semibold text-foreground">"{category.name}"</span> will be permanently deleted.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {hasProducts && (
          <div className="flex items-start gap-2.5 px-3.5 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              This category has <strong>{category._count?.products}</strong> products.
              Please reassign them first before deleting.
            </span>
          </div>
        )}

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel onClick={onClose} className="h-9 text-sm">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading || hasProducts}
            className="h-9 text-sm gap-2 bg-destructive hover:bg-destructive/90 disabled:opacity-50"
          >
            {loading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting…</>
              : <><Trash2 className="w-3.5 h-3.5" /> Delete</>
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="w-11 h-11 rounded-xl" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex justify-between pt-3 border-t">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  )
}

// ── Category Card ─────────────────────────────────────────────────────────────
interface CategoryCardProps {
  cat: Category
  onEdit: (c: Category) => void
  onDelete: (c: Category) => void
}

function CategoryCard({ cat, onEdit, onDelete }: CategoryCardProps) {
  const rgb = hexToRgb(cat.color)
  const productCount = cat._count?.products ?? 0

  return (
    <div
      className="group relative rounded-2xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md overflow-hidden cursor-default"
      style={{ ['--cat-color' as string]: cat.color }}
    >
      {/* Colored top accent */}
      <div className="absolute top-0 inset-x-0 h-0.5 rounded-t-2xl" style={{ background: cat.color }} />

      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4 mt-1">
        {/* Icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `rgba(${rgb}, 0.1)`,
            border: `1.5px solid rgba(${rgb}, 0.2)`,
          }}
        >
          <Tag className="w-4.5 h-4.5" style={{ color: cat.color }} />
        </div>

        {/* Action buttons — hover pe dikhenge */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => onEdit(cat)}
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(cat)}
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Name & description */}
      <p className="text-[15px] font-bold tracking-tight text-foreground mb-1">{cat.name}</p>
      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
        {cat.description || (
          <span className="italic opacity-60">No description</span>
        )}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3.5 border-t">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: cat.color }} />
          <span className="text-[11px] font-mono text-muted-foreground">{cat.color.toUpperCase()}</span>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            background: productCount > 0 ? `rgba(${rgb}, 0.1)` : 'hsl(var(--muted))',
            color: productCount > 0 ? cat.color : 'hsl(var(--muted-foreground))',
            border: `1px solid ${productCount > 0 ? `rgba(${rgb}, 0.2)` : 'hsl(var(--border))'}`,
          }}
        >
          {productCount} {productCount === 1 ? 'product' : 'products'}
        </span>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [fetching, setFetching] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const { user } = useAuth()
  const { branchId: globalBranchId } = useBranchFilter() 

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }
// fetchCategories function update karo
const fetchCategories = async () => {
  try {
    setFetching(true)
    const data = await categoriesService.getAll({ 
      search: search || undefined,
      branchId: globalBranchId || undefined,  // ← ye add karo
    })
    setCategories(data)
  } catch {
    showToast('Failed to load categories', 'error')
  } finally {
    setFetching(false)
  }
}

useEffect(() => {
  const t = setTimeout(fetchCategories, 300)
  return () => clearTimeout(t)
}, [search, globalBranchId])  

  const handleSave = async (payload: CreateCategoryPayload | UpdateCategoryPayload) => {
    try {
      setSaving(true)
      if (editTarget) {
        await categoriesService.update(editTarget.id, payload as UpdateCategoryPayload)
        showToast('Category updated successfully')
      } else {
        await categoriesService.create(payload as CreateCategoryPayload)
        showToast('Category created successfully')
      }
      setModalOpen(false)
      setEditTarget(null)
      fetchCategories()
    } catch {
      showToast('Something went wrong', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await categoriesService.remove(deleteTarget.id)
      showToast('Category deleted')
      setDeleteOpen(false)
      setDeleteTarget(null)
      fetchCategories()
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Cannot delete category', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )
  const totalProducts = categories.reduce((s, c) => s + (c._count?.products ?? 0), 0)
  const emptyCount = categories.filter((c) => (c._count?.products ?? 0) === 0).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-5 flex-wrap">
        <div>
          <p className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-1.5">
            Inventory
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-none">
            Categories
            {!fetching && (
              <span className="ml-2 text-xl font-normal text-muted-foreground">
                ({categories.length})
              </span>
            )}
          </h1>
        </div>
        <Button
          onClick={() => { setEditTarget(null); setModalOpen(true) }}
          className="gap-2 h-10"
        >
          <Plus className="w-4 h-4" />
          New Category
        </Button>
      </div>

      {/* ── Stats Chips ── */}
      {!fetching && (
        <div className="flex gap-3 flex-wrap">
          {[
            { dot: '#6366f1', value: categories.length, label: 'Total Categories', bg: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-800' },
            { dot: '#22c55e', value: totalProducts,      label: 'Total Products',   bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800' },
            { dot: '#f97316', value: emptyCount,         label: 'Empty',            bg: 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800' },
          ].map((s) => (
            <div
              key={s.label}
              className={`flex items-center gap-2.5 px-4 py-1.5 rounded-full text-sm font-medium border ${s.bg}`}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.dot }} />
              <strong className="text-foreground tabular-nums">{s.value}</strong>
              <span className="text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Search ── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-10 pr-9 h-10 text-sm"
          placeholder="Search categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* ── Content ── */}
      {fetching ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
            <Tag className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold text-foreground mb-1.5">
            {search ? 'No results found' : 'No categories yet'}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {search
              ? `No category matches "${search}"`
              : 'Create your first category to get started'
            }
          </p>
          {!search && (
            <Button
              onClick={() => { setEditTarget(null); setModalOpen(true) }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              New Category
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((cat) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              onEdit={(c) => { setEditTarget(c); setModalOpen(true) }}
              onDelete={(c) => { setDeleteTarget(c); setDeleteOpen(true) }}
            />
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      <CategoryModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null) }}
        onSave={handleSave}
        initial={editTarget}
        loading={saving}
      />
      <DeleteDialog
        open={deleteOpen}
        category={deleteTarget}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null) }}
        onConfirm={handleDelete}
        loading={deleting}
      />

      {/* ── Toast ── */}
      {toast && (
        <div className={`
          fixed bottom-7 left-1/2 -translate-x-1/2 z-50
          flex items-center gap-2.5 px-5 py-3 rounded-full text-sm font-semibold
          border shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200
          ${toast.type === 'success'
            ? 'bg-background border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400'
            : 'bg-background border-destructive/30 text-destructive'
          }
        `}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            : <AlertCircle className="w-4 h-4 shrink-0 text-destructive" />
          }
          {toast.msg}
        </div>
      )}
    </div>
  )
}