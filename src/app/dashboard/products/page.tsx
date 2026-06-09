'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { productsService } from '@/services/products.service'
import { categoriesService } from '@/services/categories.service'
import ProductsTable from './_components/ProductsTable'
import ProductsFilters from './_components/ProductsFilters'
import ProductModal from './_components/ProductModal'
import DeleteConfirmModal from './_components/DeleteConfirmModal'
import type { Product, CreateProductPayload } from '@/types/products.types'
import type { Category } from '@/types/categories.types'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useBranchFilter } from '@/hooks/useBranchFilter'

const LIMIT = 20

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [lowStock, setLowStock] = useState(false)

  const [addOpen, setAddOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)

  const [fetching, setFetching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
   const { branchId: globalBranchId, queryKey } = useBranchFilter() 

  const fetchProducts = useCallback(async () => {
    setFetching(true)
    try {
      const result = await productsService.getAll({
        page,
        limit: LIMIT,
        search: search || undefined,
        categoryId: categoryId || undefined,
       branchId: globalBranchId || branchId || undefined, 
        lowStock: lowStock || undefined,
      })
      setProducts(result.products)
      setTotal(result.pagination.total)
      setPages(result.pagination.pages)
    } catch {
      toast.error('Failed to load products.')
    } finally {
      setFetching(false)
    }
  }, [page, search, categoryId, globalBranchId, lowStock])

useEffect(() => {
  categoriesService.getAll({ branchId: globalBranchId || undefined })
    .then(setCategories)
    .catch(console.error)
}, [globalBranchId])  

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    setPage(1)
  }, [search, categoryId, globalBranchId, lowStock])

 const handleCreate = async (payload: CreateProductPayload, branchIds: string[]) => {
  setSubmitting(true)
  try {
    await productsService.create(payload, branchIds)
      toast.success('Product created successfully.')
      setAddOpen(false)
      fetchProducts()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create product.')
    } finally {
      setSubmitting(false)
    }
  }

const handleUpdate = async (payload: CreateProductPayload, _branchIds: string[]) => {
    if (!editProduct) return
    setSubmitting(true)
    try {
      await productsService.update(editProduct.id, payload)
      toast.success('Product updated successfully.')
      setEditProduct(null)
      fetchProducts()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update product.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteProduct) return
    setDeleting(true)
    try {
      await productsService.remove(deleteProduct.id)
      toast.success('Product deleted.')
      setDeleteProduct(null)
      fetchProducts()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete product.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Products</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {fetching ? 'Loading...' : `${total} product${total !== 1 ? 's' : ''} total`}
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        {/* Filters */}
        <ProductsFilters
          search={search}
          onSearchChange={setSearch}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          branchId={branchId}
          onBranchChange={setBranchId}
          lowStock={lowStock}
          onLowStockToggle={() => setLowStock((v) => !v)}
          categories={categories}
          branches={[]}
        />

        {/* Table */}
        <div className={fetching ? 'opacity-50 pointer-events-none transition-opacity duration-200' : 'transition-opacity duration-200'}>
          <ProductsTable
            products={products}
            onEdit={(p) => setEditProduct(p)}
            onDelete={(p) => setDeleteProduct(p)}
          />
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Page {page} of {pages}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <ProductModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleCreate}
        categories={categories}
        loading={submitting}
      />

      <ProductModal
        open={!!editProduct}
        onClose={() => setEditProduct(null)}
        onSubmit={handleUpdate}
        categories={categories}
        editProduct={editProduct}
        loading={submitting}
      />

      <DeleteConfirmModal
        open={!!deleteProduct}
        productName={deleteProduct?.name || ''}
        onConfirm={handleDelete}
        onClose={() => setDeleteProduct(null)}
        loading={deleting}
      />
    </div>
  )
}