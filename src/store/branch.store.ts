import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { branchesService } from '@/services/branches.service'

export interface Branch {
  id: string
  name: string
  code: string | null
  isMainBranch?: boolean
}

interface BranchStore {
  branches: Branch[]
  selectedBranchId: string | null
  userBranchId: string | null        // Branch jis se user login kiya
  isLoading: boolean
  setBranches: (branches: Branch[]) => void
  setSelectedBranch: (branchId: string | null) => void
  setUserBranch: (branchId: string | null) => void
  fetchBranches: () => Promise<void>
}

export const useBranchStore = create<BranchStore>()(
  persist(
    (set, get) => ({
      branches: [],
      selectedBranchId: null,
      userBranchId: null,
      isLoading: false,

      setBranches: (list) => set({ branches: list }),

      setSelectedBranch: (branchId) => set({ selectedBranchId: branchId }),

      setUserBranch: (branchId) => set({ userBranchId: branchId }),

      fetchBranches: async () => {
        set({ isLoading: true })
        try {
          const list = await branchesService.getAll()
          set({ branches: list })
        } catch (err) {
          console.error('Branches fetch failed:', err)
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'active-branch-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state: BranchStore) => ({
        selectedBranchId: state.selectedBranchId,
        userBranchId: state.userBranchId,
      }),
    }
  )
)