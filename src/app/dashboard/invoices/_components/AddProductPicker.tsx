'use client'

import { useState } from 'react'
import { X, Search, Plus, Hash } from 'lucide-react'
import type { AssignedProduct } from '@/types/dealers.types'

interface Props {
  products: AssignedProduct[]
  alreadyAddedKeys: Set<string>
  onSelect: (product: AssignedProduct) => void
  onClose: () => void
}

export default function AddProductPicker({ products, alreadyAddedKeys, onSelect, onClose }: Props) {
  const [search, setSearch] = useState('')

  const filtered = products.filter(p => {
    const key = p.productId || p.productName
    if (alreadyAddedKeys.has(key)) return false
    if (!search.trim()) return true
    return p.productName.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Select a product</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search product..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg
                bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-8">
              {products.length === 0 ? 'Is dealer ko koi product assign nahi hua.' : 'Sab products already add ho chuke hain.'}
            </p>
          ) : (
            filtered.map((p, i) => {
              const availableCount = p.serials.filter(s => !s.billed).length
              return (
                <button
                  key={(p.productId ?? p.productName) + i}
                  onClick={() => { onSelect(p); onClose() }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-left transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                      {p.productName}
                      {p.hasSerialNumbers && (
                        <span className="flex items-center gap-0.5 text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-semibold">
                          <Hash size={9} /> Serial
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {p.sku ? `${p.sku} · ` : ''}₹{p.sellingPrice} · GST {p.gstRate}%
                      {p.hasSerialNumbers ? ` · ${availableCount} available` : ` · Balance: ${p.quantity}`}
                    </p>
                  </div>
                  <Plus size={15} className="text-indigo-500 shrink-0" />
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}