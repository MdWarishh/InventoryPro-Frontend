'use client'

import { Pencil, Trash2, Package } from 'lucide-react'
import type { Product } from '@/types/products.types'
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
import { cn } from '@/lib/utils'

interface ProductsTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

function StockBadge({ stock, min }: { stock: number; min: number }) {
  const isEmpty = stock === 0
  const isLow = stock <= min && stock > 0

  return (
    <Badge
      variant="secondary"
      className={cn(
        'font-semibold tabular-nums min-w-[2.5rem] justify-center',
        isEmpty && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        isLow && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        !isEmpty && !isLow && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      )}
    >
      {stock}
    </Badge>
  )
}

export default function ProductsTable({ products = [], onEdit, onDelete }: ProductsTableProps) {
  const totalStock = (p: Product) =>
    p.productStocks.reduce((sum, s) => sum + s.currentStock, 0)

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="w-[260px]">Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Purchase Price</TableHead>
            <TableHead>Sale Price</TableHead>
            <TableHead className="text-center">Stock</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-16 text-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">No products found</p>
                    <p className="text-sm mt-0.5">Try adjusting your filters or add a new product.</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => {
              const stock = totalStock(product)
              const branchNames = product.productStocks.map((s) => s.branch.name).join(', ')

              return (
                <TableRow key={product.id} className="border-border group">
                  {/* Product Name */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-primary" />
                      </div>
                      <span
                        className="font-medium text-foreground max-w-[180px] truncate"
                        title={product.name}
                      >
                        {product.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* SKU */}
                  <TableCell>
                    <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {product.sku}
                    </code>
                  </TableCell>

                  {/* Branch */}
                  <TableCell className="text-sm text-muted-foreground">
                    {branchNames || '—'}
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    {product.category ? (
                      <Badge
                        variant="secondary"
                        className="font-medium"
                        style={{
                          backgroundColor: product.category.color
                            ? `${product.category.color}22`
                            : undefined,
                          color: product.category.color || undefined,
                          borderColor: product.category.color
                            ? `${product.category.color}44`
                            : undefined,
                        }}
                      >
                        {product.category.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Purchase Price */}
                  <TableCell className="text-sm text-muted-foreground font-medium">
                    ₹{(product.purchasePrice ?? 0).toLocaleString('en-IN')}
                  </TableCell>

                  {/* Selling Price */}
                  <TableCell className="text-sm font-semibold text-foreground">
                    ₹{(product.sellingPrice ?? 0).toLocaleString('en-IN')}
                  </TableCell>

                  {/* Stock */}
                  <TableCell className="text-center">
                    <StockBadge stock={stock} min={product.minStockAlert} />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => onEdit(product)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onDelete(product)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}