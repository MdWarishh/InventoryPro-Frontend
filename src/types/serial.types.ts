export type SerialStatus = 'AVAILABLE' | 'SOLD' | 'DAMAGED'

export interface SerialBranch {
  id: string
  name: string
}

export interface SerialProduct {
  id: string
  name: string
  sku: string
}

export interface SerialStockIn {
  id: string
  date: string
  dealer?: { name: string }
}

export interface SerialStockOut {
  id: string
  date: string
  invoice?: { invoiceNumber: string }
}

export interface SerialNumber {
  id: string
  serialNumber: string
  productId: string
  branchId: string
  status: SerialStatus
  createdAt: string
  updatedAt: string
  branch?: SerialBranch
  product?: SerialProduct
  stockIn?: SerialStockIn
  stockOut?: SerialStockOut
}