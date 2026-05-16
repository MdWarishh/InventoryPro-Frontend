/**
 * useBranchFilter — har page mein yeh hook use karo
 *
 * Yeh hook selectedBranchId return karta hai.
 * Jab bhi branch switch ho, pages automatically re-fetch karenge.
 *
 * Usage:
 *   const { branchId, queryKey } = useBranchFilter()
 *
 *   // React Query ke saath:
 *   useQuery({
 *     queryKey: ['products', ...queryKey],
 *     queryFn: () => productsService.getAll({ branchId }),
 *   })
 *
 *   // Ya direct condition:
 *   if (branchId) {
 *     // sirf selected branch ka data
 *   } else {
 *     // all branches ka data
 *   }
 */

import { useBranchStore } from '@/store/branch.store'

export function useBranchFilter() {
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId)

  return {
    /** Selected branch ID. null = All Branches */
    branchId: selectedBranchId,

    /**
     * Query key array — React Query mein spread karo.
     * Branch change hone pe query auto-invalidate hogi.
     */
    queryKey: ['branch', selectedBranchId ?? 'all'] as const,

    /** Query params object — API call mein spread karo */
    queryParams: selectedBranchId
      ? { branchId: selectedBranchId }
      : {},

    /** True agar koi specific branch select hai */
    hasBranchFilter: selectedBranchId !== null,
  }
}