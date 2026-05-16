'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateExpense } from '@/hooks/useExpenses'
import type { CreateExpensePayload, PaymentMethod } from '@/types/expenses.types'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'BANK', label: 'Bank Transfer' },
  { value: 'CARD', label: 'Card' },
  { value: 'OTHER', label: 'Other' },
]

const SUGGESTED_CATEGORIES = [
  'Food', 'Travel', 'Office', 'Utilities', 'Marketing',
  'Maintenance', 'Salary', 'Rent', 'Miscellaneous',
]

const today = () => new Date().toISOString().split('T')[0]

// ─── Default Form State ───────────────────────────────────────────────────────

const DEFAULT: CreateExpensePayload = {
  title: '',
  amount: 0,
  category: '',
  paymentMethod: 'CASH',
  notes: '',
  date: today(),
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  onSuccess: () => void
}

export function AddExpenseForm({ onSuccess }: Props) {
  const [form, setForm] = useState<CreateExpensePayload>({ ...DEFAULT, date: today() })
  const [amountErr, setAmountErr] = useState('')

  const { create, isSubmitting } = useCreateExpense(() => {
    setForm({ ...DEFAULT, date: today() })
    setAmountErr('')
    onSuccess()
  })

  const set = (key: keyof CreateExpensePayload, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    if (!form.amount || Number(form.amount) <= 0) {
      setAmountErr('Amount is required')
      return
    }
    setAmountErr('')
    await create({
      ...form,
      amount: Number(form.amount),
      title: form.title || undefined,
      category: form.category || undefined,
      notes: form.notes || undefined,
    })
  }

  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
      <CardHeader className="pb-3 pt-5 px-5">
        <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
            <Plus className="w-4 h-4 text-violet-600" />
          </div>
          Add Expense
        </CardTitle>
      </CardHeader>

      <CardContent className="px-5 pb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Amount — required */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-500">
              Amount <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">₹</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount || ''}
                onChange={(e) => set('amount', e.target.value)}
                className={`pl-7 ${amountErr ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
              />
            </div>
            {amountErr && <p className="text-xs text-red-500">{amountErr}</p>}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-500">Title</Label>
            <Input
              placeholder="e.g. Office supplies"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </div>

          {/* Category with suggestions */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-500">Category</Label>
            <Input
              list="expense-categories"
              placeholder="e.g. Travel"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            />
            <datalist id="expense-categories">
              {SUGGESTED_CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-500">Payment Method</Label>
            <Select
              value={form.paymentMethod}
              onValueChange={(v) => set('paymentMethod', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-500">Date</Label>
            <Input
              type="date"
              value={form.date}
              max={today()}
              onChange={(e) => set('date', e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <Label className="text-xs font-medium text-zinc-500">Notes</Label>
            <Input
              placeholder="Optional note..."
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-violet-600 hover:bg-violet-700 text-white gap-2 px-6"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Expense
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}