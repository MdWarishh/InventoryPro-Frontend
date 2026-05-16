'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Trash2, CheckSquare, Square } from 'lucide-react'
import api from '@/lib/axios'

export interface ItemRowData {
  productId: string
  quantity: number
  sellingPrice: number
  serialNumberIds: string[]
  // Computed
  gstRate: number
  productName: string
  hasSerialNumbers: boolean
  stock: number
}

interface Props {
  index: number
  item: ItemRowData
  branchId: string
  onChange: (data: Partial<ItemRowData>) => void
  onRemove: () => void
  currencySymbol: string
}

export default function InvoiceItemRow({ index, item, branchId, onChange, onRemove, currencySymbol }: Props) {
  const [showSerials, setShowSerials] = useState(false)

  // Fetch products with stock
  const { data: products = [] } = useQuery({
    queryKey: ['products-list'],
    queryFn: async () => {
      const { data } = await api.get('/products', { params: { limit: 999 } })
      return data.data?.items ?? data.data ?? []
    },
  })

  // Fetch current stock for selected product
  const { data: stockData = [] } = useQuery({
    queryKey: ['current-stock', branchId],
    queryFn: async () => {
      const { data } = await api.get('/stock/current', { params: { branchId } })
      return data.data ?? []
    },
    enabled: !!branchId,
  })

  // Fetch available serial numbers
  const { data: availableSerials = [] } = useQuery({
    queryKey: ['available-serials', item.productId, branchId],
    queryFn: async () => {
      const { data } = await api.get('/serials/available', { params: { productId: item.productId, branchId } })
      return data.data ?? []
    },
    enabled: !!item.productId && item.hasSerialNumbers && !!branchId,
  })

  // Jab product select ho
  const handleProductChange = (productId: string) => {
    const product = products.find((p: any) => p.id === productId)
    if (!product) return

    const stockEntry = (stockData as any[]).find((s: any) => s.productId === productId)
    const stock = stockEntry?.currentStock ?? 0

    onChange({
      productId,
      productName: product.name,
      gstRate: product.gstRate ?? 0,
      hasSerialNumbers: product.hasSerialNumbers ?? false,
      stock,
      sellingPrice: product.sellingPrice ?? 0,
      serialNumberIds: [],
      quantity: 1,
    })
    setShowSerials(false)
  }

  const toggleSerial = (id: string) => {
    const current = item.serialNumberIds
    const updated = current.includes(id)
      ? current.filter(s => s !== id)
      : [...current, id]
    onChange({ serialNumberIds: updated, quantity: updated.length })
  }

  // Computed values
  const lineTotal = item.sellingPrice * item.quantity
  const lineGST = lineTotal * (item.gstRate / 100)
  const lineTotalWithGST = lineTotal + lineGST

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Main row */}
      <div className="grid grid-cols-[1fr_80px_110px_100px_36px] gap-3 items-center px-4 py-3 bg-white">
        {/* Product select */}
        <select
          value={item.productId}
          onChange={e => handleProductChange(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
        >
          <option value="">Select product</option>
          {products.map((p: any) => {
            const s = (stockData as any[]).find((st: any) => st.productId === p.id)
            return (
              <option key={p.id} value={p.id} disabled={s ? s.currentStock === 0 : false}>
                {p.name} — {p.sku} {s ? `(Stock: ${s.currentStock})` : ''}
              </option>
            )
          })}
        </select>

        {/* Quantity */}
        <input
          type="number" min={1}
          value={item.hasSerialNumbers ? item.serialNumberIds.length : item.quantity}
          readOnly={item.hasSerialNumbers}
          onChange={e => !item.hasSerialNumbers && onChange({ quantity: Number(e.target.value) })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-center read-only:bg-gray-50"
        />

        {/* Selling price */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{currencySymbol}</span>
          <input
            type="number" min={0} step="0.01"
            value={item.sellingPrice}
            onChange={e => onChange({ sellingPrice: Number(e.target.value) })}
            className="w-full text-sm border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>

        {/* Line total */}
        <p className="text-sm font-semibold text-gray-800 text-right">
          {currencySymbol}{lineTotalWithGST.toFixed(2)}
        </p>

        {/* Remove */}
        <button type="button" onClick={onRemove}
          className="text-gray-300 hover:text-red-500 transition-colors p-1">
          <Trash2 size={15} />
        </button>
      </div>

      {/* GST info row */}
      {item.productId && (
        <div className="flex items-center gap-4 px-4 py-2 bg-gray-50/60 border-t border-gray-100 text-xs text-gray-400">
          <span>GST: {item.gstRate}%</span>
          <span>Tax: {currencySymbol}{lineGST.toFixed(2)}</span>
          <span>Base: {currencySymbol}{lineTotal.toFixed(2)}</span>
          {item.hasSerialNumbers && (
            <button
              type="button"
              onClick={() => setShowSerials(s => !s)}
              className="ml-auto text-blue-500 hover:text-blue-600 font-medium transition-colors"
            >
              {showSerials ? 'Hide' : 'Select'} Serials ({item.serialNumberIds.length}/{availableSerials.length} selected)
            </button>
          )}
        </div>
      )}

      {/* Serial checkboxes */}
      {item.hasSerialNumbers && showSerials && (
        <div className="border-t border-gray-100 bg-white">
          {availableSerials.length === 0 ? (
            <p className="px-4 py-3 text-xs text-gray-400">Koi available serial number nahi.</p>
          ) : (
            <div className="max-h-36 overflow-y-auto">
              {(availableSerials as any[]).map((s: any) => {
                const checked = item.serialNumberIds.includes(s.id)
                return (
                  <label key={s.id}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${checked ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleSerial(s.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-mono text-gray-800">{s.serialNumber}</span>
                    {checked && <span className="ml-auto text-xs text-blue-500 font-medium">Selected</span>}
                  </label>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}